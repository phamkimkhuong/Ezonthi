/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module 'firebase/auth' {
  export * from '@firebase/auth/dist/rn/index';
}


