import * as React from "react";
import {
  View,
  Animated,
  TextInput as NativeTextInput,
  StyleSheet,
  Text,
  I18nManager,
  StyleProp,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from "react-native";
import { withTheme } from "../core/theming";
import {
  GROUPS,
  COMPONENT_TYPES,
  FORM_TYPES,
  PROP_TYPES,
  FIELD_NAME,
  TEXT_INPUT_PROPS,
} from "../core/component-types";

import Icon from "./Icon";
import theme from "../styles/DefaultTheme";

const AnimatedText = Animated.createAnimatedComponent(Text);

const FOCUS_ANIMATION_DURATION = 150;
const BLUR_ANIMATION_DURATION = 180;
const ICON_SIZE = 24;

interface Props extends TextInputProps {
  type?: "solid" | "underline";
  disabled?: boolean;
  label?: string;
  error?: boolean;
  leftIconName?: string;
  leftIconMode?: "inset" | "outset";
  rightIconName?: string;
  assistiveText?: string;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  theme: typeof theme;
  render?: (props: TextInputProps) => React.ReactNode;
}

interface State {
  labeled: Animated.Value;
  focused?: boolean;
  placeholder?: string | undefined;
  defaultValue?: string | undefined;
  labelLayout: {
    measured: boolean;
    width: number;
  };
  value?: string;
}

class TextField extends React.Component<Props> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    return {
      value:
        typeof nextProps.value !== "undefined"
          ? nextProps.value
          : prevState.value,
    };
  }

  state: State = {
    labeled: new Animated.Value(this.props.value || this.props.error ? 0 : 1),
    focused: false,
    placeholder: this.props.error ? this.props.placeholder : "",
    defaultValue: this.props.value,
    labelLayout: {
      measured: false,
      width: 0,
    },
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevState.focused !== this.state.focused ||
      prevState.value !== this.state.value
    ) {
      // The label should be minimized if the text input is focused, or has text
      // In minimized mode, the label moves up and becomes small
      if (this.state.value || this.state.focused || this.props.error) {
        this._minmizeLabel();
      } else {
        this._restoreLabel();
      }
    }

    if (
      prevState.focused !== this.state.focused ||
      prevProps.label !== this.props.label
    ) {
      // Show placeholder text only if the input is focused, or has error, or there's no label
      // We don't show placeholder if there's a label because the label acts as placeholder
      // When focused, the label moves up, so we can show a placeholder
      if (this.state.focused || this.props.error || !this.props.label) {
        this._showPlaceholder();
      } else {
        this._hidePlaceholder();
      }
    }
  }

  _timer = setTimeout(() => {}, 0);

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _showPlaceholder = () => {
    clearTimeout(this._timer);

    // Set the placeholder in a delay to offset the label animation
    // If we show it immediately, they'll overlap and look ugly
    this._timer = setTimeout(
      () =>
        this.setState({
          placeholder: this.props.placeholder,
        }),
      50
    );
  };

  _hidePlaceholder = () =>
    this.setState({
      placeholder: "",
    });

  _restoreLabel = () =>
    Animated.timing(this.state.labeled, {
      toValue: 1,
      duration: FOCUS_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();

  _minmizeLabel = () =>
    Animated.timing(this.state.labeled, {
      toValue: 0,
      duration: BLUR_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();

  _handleFocus = () => {
    if (this.props.disabled) {
      return;
    }

    this.setState({ focused: true });
  };

  _handleBlur = () => {
    if (this.props.disabled) {
      return;
    }

    this.setState({ focused: false });
  };

  _handleChangeText = (
    value: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    if (this.props.disabled) {
      return;
    }

    this.setState({ value });
    this.props.onChange && this.props.onChange(value);
  };

  toggleFocus() {
    this.setState((prevState: State) => ({ focused: !prevState.focused }));
  }

  _root: NativeTextInput | undefined = undefined;
  /**
   * @internal
   */
  setNativeProps(args: Props) {
    return this._root && this._root.setNativeProps(args);
  }

  isFocused() {
    return this._root && this._root.isFocused();
  }

  clear() {
    return this._root && this._root.clear();
  }

  focus() {
    return this._root && this._root.focus();
  }

  blur() {
    return this._root && this._root.blur();
  }

  render() {
    const {
      type = "underline",
      disabled = false,
      label,
      error = false,
      leftIconName,
      leftIconMode,
      rightIconName,
      assistiveText,
      multiline = false,
      style,
      theme: { colors, typography, spacing, borderRadius, disabledOpacity },
      render = (props) => <NativeTextInput {...props} />,
      ...rest
    } = this.props;

    const MINIMIZED_LABEL_Y_OFFSET = -(
      typography.caption.lineHeight + spacing.text
    );
    const OUTLINE_MINIMIZED_LABEL_Y_OFFSET = -(
      spacing.large * 0.5 +
      spacing.text
    );
    const MAXIMIZED_LABEL_FONT_SIZE = typography.subtitle1.fontSize;
    const MINIMIZED_LABEL_FONT_SIZE = typography.caption.fontSize;

    const hasActiveOutline = this.state.focused || error;

    let inputTextColor,
      activeColor,
      underlineColor,
      borderColor,
      placeholderColor,
      containerStyle: StyleProp<ViewStyle>,
      backgroundColor,
      inputStyle: StyleProp<TextStyle>;

    inputTextColor = colors.strong;
    if (disabled) {
      activeColor = colors.light;
      placeholderColor = colors.light;
      borderColor = "transparent";
      underlineColor = "transparent";
      backgroundColor = colors.divider;
    } else {
      activeColor = error ? colors.error : colors.primary;
      placeholderColor = borderColor = colors.light;
      underlineColor = colors.light;
      backgroundColor = colors.background;
    }

    const { lineHeight, ...subtitle1 } = typography.subtitle1;

    inputStyle = {
      paddingVertical: 0,
      color: inputTextColor,
      paddingLeft:
        leftIconName && leftIconMode === "inset"
          ? ICON_SIZE + spacing.medium + (type === "solid" ? spacing.large : 0)
          : 0,
      paddingRight: rightIconName
        ? ICON_SIZE + spacing.large + spacing.text
        : spacing.medium,
      ...subtitle1,
    };

    if (!multiline) {
      inputStyle.height = lineHeight;
    }

    let assistiveTextLeftMargin;
    if (type === "underline") {
      containerStyle = {
        borderTopLeftRadius: borderRadius.global,
        borderTopRightRadius: borderRadius.global,
        paddingBottom: spacing.medium,
        marginTop: spacing.large,
      };

      if (leftIconName && leftIconMode === "outset") {
        assistiveTextLeftMargin = ICON_SIZE + spacing.small;
      } else {
        assistiveTextLeftMargin = 0;
      }
    } else {
      containerStyle = {
        borderRadius: borderRadius.global,
        borderColor: hasActiveOutline ? activeColor : borderColor,
        borderWidth: 1,
        paddingTop: this.state.labeled ? spacing.large * 1.5 : spacing.large,
        paddingBottom: this.state.labeled ? spacing.large * 0.5 : spacing.large,
        opacity: disabled ? disabledOpacity : 1,
        backgroundColor,
      };

      if (leftIconName && leftIconMode === "inset") {
        assistiveTextLeftMargin = spacing.large + spacing.text;
      } else if (leftIconName && leftIconMode === "outset") {
        assistiveTextLeftMargin = ICON_SIZE + spacing.small + spacing.medium;
      } else {
        assistiveTextLeftMargin = spacing.medium;
      }

      inputStyle.paddingHorizontal = spacing.medium;
    }

    if (leftIconName && leftIconMode === "outset") {
      containerStyle.marginLeft = ICON_SIZE + spacing.small;
    }

    let leftIconColor;
    if (error) {
      leftIconColor = colors.error;
    } else if (this.state.focused) {
      leftIconColor = colors.primary;
    } else {
      leftIconColor = colors.light;
    }

    const leftIconProps = {
      size: 24,
      color: leftIconColor,
      name: leftIconName,
    };

    const leftIconStyle = {
      position: "absolute",
      marginTop:
        type === "solid"
          ? MINIMIZED_LABEL_FONT_SIZE + spacing.text
          : leftIconMode === "outset"
          ? spacing.large
          : 0,
    };

    const labelStyle = {
      ...typography.subtitle1,
      top: type === "solid" ? spacing.large : 0,
      left:
        leftIconName && leftIconMode === "inset"
          ? ICON_SIZE + (type === "solid" ? spacing.large : spacing.medium)
          : 0,
      transform: [
        {
          // Move label to top
          translateY: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              type === "solid"
                ? OUTLINE_MINIMIZED_LABEL_Y_OFFSET
                : MINIMIZED_LABEL_Y_OFFSET,
              0,
            ],
          }),
        },
        {
          // Make label smaller
          scale: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              MINIMIZED_LABEL_FONT_SIZE / MAXIMIZED_LABEL_FONT_SIZE,
              1,
            ],
          }),
        },
        {
          // Offset label scale since RN doesn't support transform origin
          translateX: this.state.labeled.interpolate({
            inputRange: [0, 1],
            outputRange: [
              -(1 - MINIMIZED_LABEL_FONT_SIZE / MAXIMIZED_LABEL_FONT_SIZE) *
                (this.state.labelLayout.width / 2),
              0,
            ],
          }),
        },
      ],
    };

    const inputStyles = [
      styles.input,
      inputStyle,
      type === "solid" ? { marginHorizontal: spacing.medium } : {},
    ];

    return (
      <View style={[styles.container, style]}>
        {leftIconName && leftIconMode === "outset" ? (
          <Icon {...leftIconProps} style={leftIconStyle} />
        ) : null}
        <View style={containerStyle}>
          {type === "underline" ? (
            // When type === 'flat', render an underline
            <Animated.View
              style={[
                styles.underline,
                {
                  backgroundColor: error
                    ? colors.error
                    : this.state.focused
                    ? activeColor
                    : underlineColor,
                  // Underlines is thinner when input is not focused
                  transform: [{ scaleY: this.state.focused ? 1 : 0.5 }],
                },
              ]}
            />
          ) : null}

          {label ? (
            // Position colored placeholder and gray placeholder on top of each other and crossfade them
            // This gives the effect of animating the color, but allows us to use native driver
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity:
                    // Hide the label in minimized state until we measure its width
                    this.state.value || this.state.focused
                      ? this.state.labelLayout.measured
                        ? 1
                        : 0
                      : 1,
                },
              ]}
            >
              <AnimatedText
                onLayout={(e: LayoutChangeEvent) =>
                  this.setState({
                    labelLayout: {
                      width: e.nativeEvent.layout.width,
                      measured: true,
                    },
                  })
                }
                style={[
                  styles.placeholder,
                  type === "solid" ? { paddingHorizontal: spacing.medium } : {},
                  labelStyle,
                  {
                    color: colors.light,
                    opacity: this.state.labeled.interpolate({
                      inputRange: [0, 1],
                      outputRange: [hasActiveOutline ? 1 : 0, 0],
                    }),
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </AnimatedText>
              <AnimatedText
                style={[
                  styles.placeholder,
                  type === "solid" ? { paddingHorizontal: spacing.medium } : {},
                  labelStyle,
                  {
                    color: placeholderColor,
                    opacity: hasActiveOutline ? this.state.labeled : 1,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </AnimatedText>
            </View>
          ) : null}

          {leftIconName && leftIconMode === "inset" ? (
            <Icon
              {...leftIconProps}
              style={{
                ...leftIconStyle,
                marginLeft: type === "solid" ? spacing.large : 0,
              }}
            />
          ) : null}

          {render({
            ...rest,
            ref: (c: any) => {
              this._root = c;
            },
            onChange: this._handleChangeText,
            placeholder: label
              ? this.state.placeholder
              : this.props.placeholder,
            placeholderTextColor: placeholderColor,
            editable: !disabled,
            selectionColor: activeColor,
            multiline,
            onFocus: this._handleFocus,
            onBlur: this._handleBlur,
            underlineColorAndroid: "transparent",
            style: inputStyles,
          })}
        </View>
        {rightIconName ? (
          <Icon
            name={rightIconName}
            size={ICON_SIZE}
            color={colors.light}
            style={{
              position: "absolute",
              right: spacing.large,
              marginTop:
                type === "solid"
                  ? MINIMIZED_LABEL_FONT_SIZE + spacing.text
                  : spacing.large,
            }}
          />
        ) : null}

        {assistiveText ? (
          <Text
            style={[
              {
                color: error ? colors.error : colors.light,
                marginTop: spacing.small,
                marginLeft: assistiveTextLeftMargin,
              },
            ]}
          >
            {assistiveText}
          </Text>
        ) : null}
      </View>
    );
  }
}

export default withTheme(TextField);

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
  placeholder: {
    position: "absolute",
    left: 0,
  },
  underline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
  },
  input: {
    flexGrow: 1,
    justifyContent: "center",
    textAlignVertical: "center",
    margin: 0,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});

const SEED_DATA_PROPS = {
  ...TEXT_INPUT_PROPS,
  label: {
    group: GROUPS.data,
    label: "Label",
    description: "The label to be displayed on the text field",
    formType: FORM_TYPES.string,
    propType: PROP_TYPES.STRING,
    defaultValue: "First Name",
    editable: true,
    required: true,
  },
  assistiveText: {
    group: GROUPS.basic,
    label: "Assistive text",
    description: "Helper text to display below the input",
    formType: FORM_TYPES.string,
    propType: PROP_TYPES.STRING,
    defaultValue: null,
    editable: true,
    required: false,
  },
  disabled: {
    group: GROUPS.basic,
    label: "Disabled",
    description:
      "Whether the input should be disabled. Will prevent input and show a greyed out state.",
    formType: FORM_TYPES.boolean,
    propType: PROP_TYPES.BOOLEAN,
    defaultValue: null,
    editable: true,
    required: false,
  },
  error: {
    group: GROUPS.data,
    label: "Error",
    description: "Whether the input should display the error state",
    formType: FORM_TYPES.boolean,
    propType: PROP_TYPES.BOOLEAN,
    defaultValue: null,
    editable: true,
    required: false,
  },
  leftIconName: {
    group: GROUPS.basic,
    label: "Left icon name",
    description: "The icon to display on the left",
    formType: FORM_TYPES.icon,
    propType: PROP_TYPES.ASSET,
    defaultValue: null,
    editable: true,
    required: false,
  },
  leftIconMode: {
    group: GROUPS.basic,
    label: "Left icon mode",
    description:
      "The mode of the icon to display on the left. 'inset' or 'outset'.",
    formType: FORM_TYPES.flatArray,
    propType: PROP_TYPES.STRING,
    defaultValue: "inset",
    options: ["inset", "outset"],
    editable: true,
    required: true,
  },
  rightIconName: {
    group: GROUPS.basic,
    label: "Right icon name",
    description: "The icon to display on the right",
    formType: FORM_TYPES.icon,
    propType: PROP_TYPES.ASSET,
    defaultValue: null,
    editable: true,
    required: false,
  },
  fieldName: {
    ...FIELD_NAME,
    handlerPropName: "onChangeText",
    defaultValue: "textFieldValue",
  },
};

export const SEED_DATA = [
  {
    name: "Text Field - Solid",
    tag: "TextField",
    description: "A text input with a solid border",
    category: COMPONENT_TYPES.field,
    preview_image_url: "{CLOUDINARY_URL}/Textfield.png",
    supports_list_render: false,
    props: {
      ...SEED_DATA_PROPS,
      type: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "solid",
        editable: false,
        required: false,
      },
      secureTextEntry: {
        group: GROUPS.basic,
        label: "Password field",
        description:
          "If true, this turns the field into a password field, hiding the text",
        formType: FORM_TYPES.boolean,
        propType: PROP_TYPES.BOOLEAN,
        defaultValue: null,
        editable: true,
        required: false,
      },
    },
    layout: {},
  },
  {
    name: "Text Field - Underline",
    tag: "TextField",
    description: "A text input with an underline",
    category: COMPONENT_TYPES.field,
    preview_image_url: "{CLOUDINARY_URL}/Textfield.png",
    supports_list_render: false,
    props: {
      ...SEED_DATA_PROPS,
      type: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "underline",
        editable: false,
        required: false,
      },
      secureTextEntry: {
        group: GROUPS.basic,
        label: "Password field",
        description:
          "If true, this turns the field into a password field, hiding the text",
        formType: FORM_TYPES.boolean,
        propType: PROP_TYPES.BOOLEAN,
        defaultValue: null,
        editable: true,
        required: false,
      },
    },
    layout: {},
  },
  {
    name: "Text Area - Solid",
    tag: "TextField",
    description: "A text area with a solid border",
    category: COMPONENT_TYPES.field,
    preview_image_url: "{CLOUDINARY_URL}/TextArea.png",
    supports_list_render: false,
    props: {
      ...SEED_DATA_PROPS,
      type: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "solid",
        editable: false,
        required: false,
      },
      multiline: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.boolean,
        propType: PROP_TYPES.BOOLEAN,
        defaultValue: true,
        editable: false,
        required: false,
      },
    },
    layout: {},
  },
  {
    name: "Text Area - Underline",
    tag: "TextField",
    description: "A text area with an underline",
    category: COMPONENT_TYPES.field,
    preview_image_url: "{CLOUDINARY_URL}/TextArea.png",
    supports_list_render: false,
    props: {
      ...SEED_DATA_PROPS,
      type: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "underline",
        editable: false,
        required: false,
      },
      multiline: {
        group: GROUPS.uncategorized,
        formType: FORM_TYPES.boolean,
        propType: PROP_TYPES.BOOLEAN,
        defaultValue: true,
        editable: false,
        required: false,
      },
    },
    layout: {},
  },
];