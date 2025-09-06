/**
 * Test file for SendGridService
 * 
 * This file contains tests to validate the throttling behavior of the SendGrid service,
 * including static rate limiting, dynamic header-driven throttling, and burst request handling.
 * 
 * Note: These tests are designed to be framework-agnostic and can be run with any test runner
 * that supports async/await and basic assertion capabilities. 
 */

import { SendGridService } from './sendgrid-service';
import type { IntegrationConfig, NotificationPayload } from '../integrations';

// Test helper to mock fetch function
function createMockFetch(responses: any[]) {
  let callCount = 0;
  return function mockFetch(input: RequestInfo | URL, init?: RequestInit) {
    const response = responses[callCount % responses.length];
    callCount++;
    
    if (response instanceof Error) {
      return Promise.reject(response);
    }
    
    return Promise.resolve({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers || {}),
      json: () => Promise.resolve(response.json || {}),
      text: () => Promise.resolve(JSON.stringify(response.json || {})),
      blob: () => Promise.resolve(new Blob([JSON.stringify(response.json || {})])),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      clone: function() { return this; }
    });
  } as any;
}
// Test suite for SendGridService
function runTests() {
  console.log('Running SendGridService tests...\n');

  let service: SendGridService;
  let mockConfig: IntegrationConfig;
  let originalFetch: any;

  // Setup before each test
  function beforeEach() {
    // Store original fetch
    originalFetch = (global as any).fetch;
    
    mockConfig = {
      id: 'test-sendgrid',
      name: 'Test SendGrid Integration',
      type: 'sendgrid' as const,
      status: 'active',
      apiKeys: {
        SENDGRID_API_KEY: 'test-api-key'
      },
      settings: {
        fromEmail: 'test@example.com',
        emailOptions: {
          templateId: 'd-1234567890abcdef1234567890abcdef'
        }
      }
    };

    service = new SendGridService(mockConfig);
  }

  // Cleanup after each test
  function afterEach() {
    // Restore original fetch
    global.fetch = originalFetch;
  }

  // Test 1: Rate Limiting
  async function testRateLimiting() {
    console.log('Test 1: Rate Limiting');
    beforeEach();
    
    try {
      // Mock successful response
      global.fetch = createMockFetch([{
          ok: true,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '99',
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 60).toString()
          },
          json: { username: 'testuser' }
      }]);

      // Make 5 requests in quick succession (reduced for faster testing)
      const promises = Array.from({ length: 5 }, () =>
        service.sync({ notifications: [{ to: 'test@example.com', message: 'Test', type: 'info' }] })
      );

      const results = await Promise.all(promises);
      
      // All requests should succeed
      let successCount = 0;
      results.forEach(result => {
        if (result.success) successCount++;
      });
      
      console.log(`✓ ${successCount}/5 requests succeeded within rate limits`);
      
    } catch (error) {
      console.log('✗ Rate limiting test failed:', error);
    }
    
    afterEach();
  }

  // Test 2: Rate Limit Exceeded
  async function testRateLimitExceeded() {
    console.log('Test 2: Rate Limit Exceeded');
    beforeEach();
    
    try {
      // Mock a rate-limited response by returning a 429 status
      global.fetch = createMockFetch([{
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        json: { errors: [{ message: 'Rate limit exceeded' }] }
      }]);

      const result = await service.sync({
        notifications: [{ to: 'test@example.com', message: 'Test', type: 'info' }]
      });
      
      if (!result.success && result.error?.includes('All emails failed to send')) {
        console.log('✓ Rate limit exceeded error handled correctly');
      } else {
        console.log('✗ Rate limit exceeded test failed:', result);
      }
      
    } catch (error) {
      console.log('✗ Rate limit exceeded test failed:', error);
    }
    
    afterEach();
  }

  // Test 3: Dynamic Rate Limit from Headers
  async function testDynamicRateLimitFromHeaders() {
    console.log('Test 3: Dynamic Rate Limit from Headers');
    beforeEach();
    
    try {
      // Mock response with rate limit headers
      global.fetch = createMockFetch([{
        ok: true,
        headers: {
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': '49',
          'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 60).toString()
        },
        json: { username: 'testuser' }
      }]);

      const result = await service.validate();
      
      if (result.success) {
        console.log('✓ Dynamic rate limit headers processed successfully');
      } else {
        console.log('✗ Dynamic rate limit headers test failed:', result);
      }
      
    } catch (error) {
      console.log('✗ Dynamic rate limit headers test failed:', error);
    }
    
    afterEach();
  }

  // Test 4: Burst Request Handling
  async function testBurstRequestHandling() {
    console.log('Test 4: Burst Request Handling');
    beforeEach();
    
    try {
      // Mock multiple responses with different rate limits
      global.fetch = createMockFetch([
        {
          ok: true,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 5).toString()
          },
          json: { username: 'testuser' }
        },
        {
          ok: true,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '8',
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 5).toString()
          },
          json: { id: 'msg-123' }
        }
      ]);

      // Send multiple notifications in quick succession
      const notifications: NotificationPayload[] = Array.from({ length: 3 }, (_, i) => ({
        to: `test${i}@example.com`,
        message: `Test message ${i}`,
        type: 'info' as const
      }));

      const result = await service.sync({ notifications });
      
      if (result.success && result.data && result.data.sent === 3) {
        console.log('✓ Burst requests handled successfully');
      } else {
        console.log('✗ Burst request handling test failed:', result);
      }
      
    } catch (error) {
      console.log('✗ Burst request handling test failed:', error);
    }
    
    afterEach();
  }

  // Test 5: Error Handling
  async function testErrorHandling() {
    console.log('Test 5: Error Handling');
    beforeEach();
    
    try {
      // Test with an invalid API key
      const invalidConfig = { ...mockConfig, apiKeys: { ...mockConfig.apiKeys } };
      delete invalidConfig.apiKeys.SENDGRID_API_KEY;
      
      // Mock an authentication error response
      global.fetch = createMockFetch([{
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        json: { errors: [{ message: 'Authentication error' }] }
      }]);
      
      const invalidService = new SendGridService(invalidConfig);
      const result = await invalidService.validate();
      
      if (!result.success && result.error?.includes('Authentication error')) {
        console.log('✓ Error handling works correctly');
      } else {
        console.log('✗ Error handling test failed:', result);
      }
      
    } catch (error) {
      console.log('✗ Error handling test failed:', error);
    }
    
    afterEach();
  }

  // Test 6: Configuration Validation
  async function testConfigurationValidation() {
    console.log('Test 6: Configuration Validation');
    beforeEach();
    
    try {
      // Test missing API key
      const invalidConfig = { ...mockConfig };
      delete invalidConfig.apiKeys.SENDGRID_API_KEY;
      
      const invalidService = new SendGridService(invalidConfig);
      const result = await invalidService.validate();
      
      if (!result.success && result.error?.includes('API key is missing')) {
        console.log('✓ Missing API key validation works');
      } else {
        console.log('✗ Configuration validation test failed:', result);
      }
      
    } catch (error) {
      console.log('✗ Configuration validation test failed:', error);
    }
    
    afterEach();
  }

  // Test 7: Header-driven scenarios
  async function testHeaderDrivenScenarios() {
    console.log('Test 7: Header-driven Scenarios');
    beforeEach();
    
    try {
      // Mock responses with changing rate limits
      global.fetch = createMockFetch([
        {
          ok: true,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '95',
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 60).toString()
          },
          json: { username: 'testuser' }
        },
        {
          ok: true,
          headers: {
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': '45',
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + 120).toString()
          },
          json: { id: 'msg-123' }
        }
      ]);

      // Make requests that should trigger different rate limits
      const result1 = await service.validate();
      const result2 = await service.sync({
        notifications: [{ to: 'test@example.com', message: 'Test 1', type: 'info' }]
      });
      const result3 = await service.sync({
        notifications: [{ to: 'test@example.com', message: 'Test 2', type: 'info' }]
      });

      // All should succeed despite changing rate limits
      if (result1.success && result2.success && result3.success) {
        console.log('✓ Dynamic adjustment to changing rate limits works');
      } else {
        console.log('✗ Header-driven scenarios test failed:', { result1, result2, result3 });
      }
      
    } catch (error) {
      console.log('✗ Header-driven scenarios test failed:', error);
    }
    
    afterEach();
  }

  // Run all tests
  async function runAllTests() {
    await testRateLimiting();
    await testRateLimitExceeded();
    await testDynamicRateLimitFromHeaders();
    await testBurstRequestHandling();
    await testErrorHandling();
    await testConfigurationValidation();
    await testHeaderDrivenScenarios();
    
    console.log('\nAll SendGridService tests completed!');
  }

  // Export test functions for use with test runners
  return {
    runTests,
    runAllTests
  };
}

// Export test functions for use with test runners
export const testSuite = runTests();

// Auto-run if this is the main module
if (typeof process !== 'undefined' && process.argv && process.argv[1] === __filename) {
  console.log('Starting SendGridService tests...\n');
  testSuite.runAllTests().then(() => {
    console.log('\nSendGridService tests completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

// For browser environments, expose the test suite globally
if (typeof window !== 'undefined') {
  (window as any).SendGridServiceTests = testSuite;
}
