import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size: number;
  color: string;
};
export default function ManagerIcon({ size = 16, color }: Props) {
  return (
    <Svg viewBox="0 0 16 16" width={size} height={size}>
      <Path
        fill={color}
        d="M5.355 5.648c-.672.677-1.248 1.267-1.728 1.771L.363 4.155a1 1 0 0 1 0-1.414L2.717.387a1 1 0 0 1 1.414 0l2.038 2.038c-.285.476-.394 1.073-.33 1.792L3.425 1.801 1.777 3.448l1.034 1.034.477-.477a.3.3 0 0 1 .424 0l.283.283a.3.3 0 0 1 0 .424l-.477.477.793.793.477-.477a.3.3 0 0 1 .424 0l.143.143zm6.525 4.61a5.282 5.282 0 0 0 1.761-.36l1.896 1.895a1 1 0 0 1 0 1.414l-2.354 2.354a1 1 0 0 1-1.414 0L8.58 12.373a66.571 66.571 0 0 0 1.754-1.745l.16.16a.3.3 0 0 1 0 .424l-.477.477.793.793.477-.477a.3.3 0 0 1 .424 0l.283.283a.3.3 0 0 1 0 .424l-.477.477.958.957 1.646-1.646-2.242-2.242zm.661-5.826l1.51-1.51a.697.697 0 0 1 1.1.152c.94 1.67.744 3.259-.575 4.577-1.153 1.154-2.565 1.502-4.127 1.02a.232.232 0 0 0-.233.057L3.71 15.234a2.09 2.09 0 1 1-2.955-2.956L7.26 5.772c.06-.06.083-.15.057-.232-.483-1.562-.134-2.974 1.02-4.128C9.655.094 11.244-.1 12.914.838a.697.697 0 0 1 .15 1.1l-1.509 1.51.165.82.82.164zM1.74 14.25a.697.697 0 0 0 .985 0l6.506-6.506a1.625 1.625 0 0 1 1.63-.404c1.068.33 1.942.115 2.73-.673.63-.63.862-1.277.702-2.015l-.854.854a1.161 1.161 0 0 1-1.049.318l-1.095-.22a1.161 1.161 0 0 1-.91-.91l-.22-1.094a1.168 1.168 0 0 1 .318-1.05l.855-.854c-.738-.16-1.386.073-2.016.702-.787.788-1.003 1.662-.673 2.73a1.625 1.625 0 0 1-.403 1.63L1.74 13.264a.697.697 0 0 0 0 .986z"
      />
    </Svg>
  );
}
