import React, { useState, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  NativeSyntheticEvent,
  TargetedEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface CustomTextInputProps extends TextInputProps {
  label?: string;
  labelRight?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  focusBorderColor?: string;
  height?: number;
}

export const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
  (
    {
      label,
      labelRight,
      leftIcon,
      rightIcon,
      error,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      labelStyle,
      focusBorderColor,
      height = 48,
      multiline = false,
      value,
      placeholder,
      onChangeText,
      onFocus,
      onBlur,
      style,
      ...restProps
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const activeBorderColor = focusBorderColor || colors.primary;

    const handleFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    // Soft glow shadow style on focus
    const webGlowStyle =
      Platform.OS === 'web' && isFocused
        ? { boxShadow: `0 0 0 3px ${activeBorderColor}25` }
        : {};

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {(label || labelRight) ? (
          <View style={styles.labelRow}>
            {label ? (
              <Text style={[styles.label, { color: colors.textMuted }, labelStyle]}>
                {label}
              </Text>
            ) : <View />}
            {labelRight}
          </View>
        ) : null}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBg || colors.background,
              borderColor: error
                ? '#ef4444'
                : isFocused
                ? activeBorderColor
                : colors.inputBorder || colors.border,
              height: multiline ? undefined : height,
              minHeight: multiline ? height : undefined,
            },
            isFocused && styles.focusedGlow,
            isFocused && { shadowColor: activeBorderColor },
            webGlowStyle as any,
            inputContainerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            value={value}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            selectionColor={colors.primary}
            style={[
              styles.textInput,
              {
                color: colors.text,
                height: multiline ? undefined : '100%',
                textAlignVertical: multiline ? 'top' : 'center',
              },
              Platform.OS === 'web'
                ? ({
                    outlineStyle: 'none',
                    outlineWidth: 0,
                    outlineColor: 'transparent',
                    borderWidth: 0,
                    borderStyle: 'none',
                  } as any)
                : {},
              inputStyle,
              style,
            ]}
            {...restProps}
          />

          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

CustomTextInput.displayName = 'CustomTextInput';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  focusedGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  iconLeft: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
    includeFontPadding: false,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
