import SilverText from "./SilverText";

export default function SilverTextDemo() {
  return (
    <div style={{ padding: "2rem", backgroundColor: "#000", minHeight: "100vh" }}>
      <h1 style={{ color: "white", marginBottom: "2rem" }}>SilverText Component Demo</h1>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText size="sm">Small Silver Text</SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText>Default Silver Text</SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText size="lg">Large Silver Text</SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText size="xl">Extra Large Silver Text</SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText animated>Animated Silver Text</SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText 
          size="lg" 
          animated 
          style={{ fontWeight: 700 }}
        >
          Large Animated Bold Silver Text
        </SilverText>
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <SilverText className="custom-silver">
          Custom Class Silver Text
        </SilverText>
      </div>
    </div>
  );
}
