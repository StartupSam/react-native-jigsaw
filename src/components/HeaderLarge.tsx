import * as React from "react";
import { withTheme } from "../core/theming";
import { GROUPS, COMPONENT_TYPES, FORM_TYPES } from "../core/component-types";
import Header from "./Header";
import theme from "../styles/DefaultTheme";
import { StyleProp, ViewStyle } from "react-native";

interface Props {
  title: string;
  buttonText: string;
  icon: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  theme: typeof theme;
}

const HeaderLarge: React.FC<Props> = ({
  title,
  buttonText,
  icon,
  onPress = () => {},
  style,
  theme: { colors, typography },
}) => {
  return (
    <Header
      titleTypeStyle={typography.headline4}
      titleColor={colors.strong}
      title={title}
      buttonText={buttonText}
      icon={icon}
      onPress={onPress}
      style={style}
    />
  );
};

export default withTheme(HeaderLarge);

export const SEED_DATA = [
  {
    name: "Header Large",
    tag: "HeaderLarge",
    description:
      "A large header with an optional touchable right aligned text and icon.",
    category: COMPONENT_TYPES.header,
    preview_image_url: "{CLOUDINARY_URL}/Header_HeadlineLargeIconText.png",
    supports_list_render: false,
    props: {
      title: {
        group: GROUPS.data,
        label: "Title",
        description: "Text to display",
        formType: FORM_TYPES.string,
        defaultValue: "Title",
        editable: true,
        required: false,
      },
      buttonText: {
        group: GROUPS.data,
        label: "Button text",
        description: "Right aligned button text to display",
        formType: FORM_TYPES.string,
        defaultValue: "See All",
        editable: true,
        required: false,
      },
      icon: {
        group: GROUPS.basic,
        label: "Icon",
        description: "Name of icon to display",
        formType: FORM_TYPES.icon,
        defaultValue: null,
        editable: true,
        required: false,
      },
      onPress: {
        group: GROUPS.basic,
        label: "Action",
        description: "Action to execute when button pressed",
        editable: true,
        required: false,
        formType: FORM_TYPES.action,
        defaultValue: null,
      },
    },
    layout: {},
  },
];
