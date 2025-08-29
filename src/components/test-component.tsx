import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a test component to check if the issue is with component rendering.</p>
      </CardContent>
    </Card>
  );
};

export default TestComponent;