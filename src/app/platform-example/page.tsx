"use client";

import { useState } from 'react';
import { PlatformLayout } from '@/components/platform-layout';
import { ResponsiveContainer as PlatformContainer, ResponsiveText, ResponsiveGrid } from '@/components/responsive-container';
import { PlatformNavigation, defaultNavigationItems } from '@/components/platform-navigation';
import { PlatformForm, PlatformButton, PlatformInput, useForm } from '@/components/platform-forms';
import { PlatformThemeProvider, usePlatformTheme, PlatformCard, PlatformText } from '@/components/platform-theme';
import { PlatformAccessibility, useAccessibility, HighContrastToggle, FontSizeControls } from '@/components/platform-accessibility';
import { cn } from '@/lib/utils';

const exampleFields = [
  {
    id: 'name',
    label: 'Full Name',
    type: 'text' as const,
    placeholder: 'Enter your full name',
    required: true,
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email' as const,
    placeholder: 'Enter your email',
    required: true,
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel' as const,
    placeholder: 'Enter your phone number',
  },
  {
    id: 'message',
    label: 'Message',
    type: 'textarea' as const,
    placeholder: 'Tell us about your environmental concerns...',
  },
];

export default function PlatformExamplePage() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const { theme, toggleTheme, config } = usePlatformTheme();
  const { updateSetting, announceSuccess, announceError } = useAccessibility();

  const handleNavClick = (item: any) => {
    setActiveNav(item.id);
    announceSuccess(`Navigated to ${item.label}`);
  };

  const handleFormSubmit = (values: any) => {
    console.log('Form submitted:', values);
    announceSuccess('Form submitted successfully!');
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <PlatformThemeProvider>
      <PlatformAccessibility>
        <PlatformLayout
          navigation={{
            type: 'bottom',
            items: defaultNavigationItems,
            activeItemId: activeNav,
            onItemClick: handleNavClick,
          }}
          header={{
            title: 'Platform Demo',
            subtitle: 'Experience multi-platform support',
            actions: (
              <div className="flex items-center space-x-2">
                <HighContrastToggle
                  enabled={config.contrast === 'high'}
                  onToggle={() => updateSetting('contrast', 
                    config.contrast === 'high' ? 'normal' : 'high'
                  )}
                />
                <FontSizeControls
                  currentSize={config.fontSize.base ? 'medium' : 'small'}
                  onChange={(size) => updateSetting('fontSize', size)}
                />
                <PlatformButton
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </PlatformButton>
              </div>
            ),
          }}
        >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <PlatformContainer maxWidth="xl" className="py-8">
              <ResponsiveText size="3xl" weight="bold" className="mb-6">
                Multi-Platform Support Demo
              </ResponsiveText>
              
              <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
                <PlatformCard elevation="md" className="p-6">
                  <PlatformText variant="heading" className="mb-4">
                    Platform Detection
                  </PlatformText>
                  <div className="space-y-3">
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      Current Platform: <span className="font-medium">
                        {typeof window !== 'undefined' ? navigator.userAgent.includes('iPhone') ? 'iOS' : 
                          navigator.userAgent.includes('Android') ? 'Android' : 'Web' : 'Web'}
                      </span>
                    </ResponsiveText>
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      Theme: <span className="font-medium">{theme}</span>
                    </ResponsiveText>
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      Font Size: <span className="font-medium">{config.fontSize.base ? 'Medium' : 'Small'}</span>
                    </ResponsiveText>
                  </div>
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6">
                  <PlatformText variant="heading" className="mb-4">
                    Navigation Demo
                  </PlatformText>
                  <div className="space-y-3">
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      Active Navigation: <span className="font-medium">{activeNav}</span>
                    </ResponsiveText>
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      Try clicking on different navigation items below
                    </ResponsiveText>
                  </div>
                  <PlatformNavigation
                    items={[
                      { id: 'demo1', label: 'Demo 1', href: '#' },
                      { id: 'demo2', label: 'Demo 2', href: '#' },
                      { id: 'demo3', label: 'Demo 3', href: '#' },
                    ]}
                    activeItemId="demo1"
                    onItemClick={(item) => handleNavClick(item)}
                    className="mt-4"
                  />
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6">
                  <PlatformText variant="heading" className="mb-4">
                    Form Demo
                  </PlatformText>
                  <PlatformForm
                    fields={exampleFields}
                    onSubmit={handleFormSubmit}
                    className="space-y-4"
                  />
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6 md:col-span-2">
                  <PlatformText variant="heading" className="mb-4">
                    Responsive Layout
                  </PlatformText>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Card 1', 'Card 2', 'Card 3', 'Card 4'].map((title, index) => (
                      <PlatformCard key={index} elevation="sm" className="p-4 text-center">
                        <PlatformText variant="subtitle">{title}</PlatformText>
                        <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mt-2">
                          Responsive content
                        </ResponsiveText>
                      </PlatformCard>
                    ))}
                  </div>
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6">
                  <PlatformText variant="heading" className="mb-4">
                    Accessibility Features
                  </PlatformText>
                  <div className="space-y-4">
                    <div>
                      <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mb-2">
                        Reduce Motion
                      </ResponsiveText>
                      <PlatformButton
                        variant="outline"
                        size="sm"
                        onClick={() => updateSetting('animations', !config.animations)}
                      >
                        {config.animations ? 'Disable' : 'Enable'} Animations
                      </PlatformButton>
                    </div>
                    <div>
                      <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mb-2">
                        High Contrast
                      </ResponsiveText>
                      <HighContrastToggle
                        enabled={config.contrast === 'high'}
                        onToggle={() => updateSetting('contrast', 
                          config.contrast === 'high' ? 'normal' : 'high'
                        )}
                      />
                    </div>
                  </div>
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6">
                  <PlatformText variant="heading" className="mb-4">
                    Theme Customization
                  </PlatformText>
                  <div className="space-y-4">
                    <div>
                      <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400 mb-2">
                        Current Theme
                      </ResponsiveText>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: config.colors.primary }}
                        />
                        <ResponsiveText size="sm">
                          {config.colors.primary}
                        </ResponsiveText>
                      </div>
                    </div>
                    <PlatformButton
                      variant="outline"
                      size="sm"
                      onClick={toggleTheme}
                      className="w-full"
                    >
                      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </PlatformButton>
                  </div>
                </PlatformCard>

                <PlatformCard elevation="md" className="p-6 md:col-span-3">
                  <PlatformText variant="heading" className="mb-4">
                    Platform-Specific Features
                  </PlatformText>
                  <div className="space-y-4">
                    <ResponsiveText size="sm" className="text-gray-600 dark:text-gray-400">
                      This demo showcases how the EcoAlert platform adapts to different devices and platforms:
                    </ResponsiveText>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <ResponsiveText size="sm">Responsive layouts that work on all screen sizes</ResponsiveText>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <ResponsiveText size="sm">Platform-specific navigation patterns (bottom nav on mobile)</ResponsiveText>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <ResponsiveText size="sm">Adaptive form inputs for different platforms</ResponsiveText>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <ResponsiveText size="sm">Accessibility features for all users</ResponsiveText>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <ResponsiveText size="sm">Theme support with system preference detection</ResponsiveText>
                      </li>
                    </ul>
                  </div>
                </PlatformCard>
              </ResponsiveGrid>
            </PlatformContainer>
          </div>
        </PlatformLayout>
      </PlatformAccessibility>
    </PlatformThemeProvider>
  );
}