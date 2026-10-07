import { KeyboardReact } from "react-simple-keyboard";
import { Box, Button, Center } from "rsuite";

interface CrytpicKeyboardProps {
  handleKeyDown: (event: KeyboardEvent, virtual: boolean) => void;
}

export default function CrytpicKeyboard({ handleKeyDown }: CrytpicKeyboardProps) {
  return (
    <Box className="cryptic-keyboard">
      <KeyboardReact
        theme="hg-theme-default"
        onKeyPress={(key) => {
          let keyCode = key;
          if (key === "{bksp}") keyCode = "Backspace";
          if (key === "{enter}") keyCode = "Enter";
          if (key === "{esc}") keyCode = "Escape";
          if (key === "{tab}") keyCode = "Tab";
          handleKeyDown(new KeyboardEvent("keydown", { key: keyCode }), true);
        }}
        layout={{
          default: ["Q W E R T Y U I O P", "A S D F G H J K L", "{enter} Z X C V B N M {bksp}"]
        }}
        display={{
          "{enter}": " ",
          "{bksp}": " "
        }}
        layoutName={"default"}
        disableButtonHold={true}
      />
    </Box>
  );
}
