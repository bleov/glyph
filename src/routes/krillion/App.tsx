import { Content } from "rsuite";
import Krillion from "./Components/Krillion";
import { useEffect } from "react";

export default function KrillionApp() {
  useEffect(() => {
    document.title = "Krillion – Glyph";
  }, []);

  return (
    <Content className="krillion">
      <Krillion />
    </Content>
  );
}
