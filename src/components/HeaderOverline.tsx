import * as React from "react";
import { withTheme } from "../core/theming";
import {
  GROUPS,
  COMPONENT_TYPES,
  FORM_TYPES,
  PROP_TYPES,
} from "../core/component-types";
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

const HeaderOverline: React.FC<Props> = ({
  title,
  buttonText,
  icon,
  onPress = () => {},
  style,
  theme: { colors, typography, spacing },
}) => {
  return (
    <Header
      titleTypeStyle={typography.overline}
      titleColor={colors.light}
      title={title && title.toUpperCase()}
      buttonText={buttonText}
      icon={icon}
      dividerTopMargin={spacing.medium}
      onPress={onPress}
      style={style}
    />
  );
};

export default withTheme(HeaderOverline);

export const SEED_DATA = [
  {
    name: "Header Overline",
    tag: "HeaderOverline",
    description:
      "A small header with an optional touchable right aligned text and icon.",
    category: COMPONENT_TYPES.header,
    preview_image_url: "{CLOUDINARY_URL}/Header_OverlineIconText.png",
    supports_list_render: false,
    props: {
      title: {
        group: GROUPS.data,
        label: "Title",
        description: "Text to display",
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "Title",
        editable: true,
        required: false,
      },
      buttonText: {
        group: GROUPS.data,
        label: "Button text",
        description: "Right aligned button text to display",
        formType: FORM_TYPES.string,
        propType: PROP_TYPES.STRING,
        defaultValue: "See All",
        editable: true,
        required: false,
      },
      icon: {
        group: GROUPS.basic,
        label: "Icon",
        description: "Name of icon to display",
        formType: FORM_TYPES.icon,
        propType: PROP_TYPES.ASSET,
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
        propType: PROP_TYPES.STRING,
        defaultValue: null,
      },
    },
    layout: {},
  },
];
