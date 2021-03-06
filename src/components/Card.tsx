import React from "react";
import { withTheme } from "../core/theming";
import Touchable from "./Touchable";
import Config from "./Config";
import { StyleProp, ViewStyle } from "react-native";
import theme from "../styles/DefaultTheme";

interface Props {
  numColumns?: number;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  theme: typeof theme;
}
const Card: React.FC<Props> = ({
  numColumns = 3,
  children,
  onPress,
  theme: { spacing },
  style,
}) => {
  let cardStyle;
  if (numColumns === 1) {
    cardStyle = {
      width: (Config.windowWidth - spacing.gutters * 2 - spacing.small * 2) / 3,
    };
  } else if (numColumns === 2) {
    cardStyle = {
      width: (Config.windowWidth - spacing.gutters * 2 - spacing.small) / 2,
    };
  } else {
    cardStyle = { width: Config.windowWidth - spacing.gutters * 2 };
  }

  return (
    <Touchable disabled={!onPress} onPress={onPress} style={[cardStyle, style]}>
      {children}
    </Touchable>
  );
};

export default withTheme(Card);
