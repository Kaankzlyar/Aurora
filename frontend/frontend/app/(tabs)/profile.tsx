import { View, Text } from "react-native";
import AuroraHeader from "../../components/AuroraHeader";

export default function Screen() {
  return (
    <View style={{ flex:1, backgroundColor:"#0B0B0B" }}>
      <AuroraHeader />
      <Text style={{ color:"#fff", padding:20 }}>İçerik yakında…</Text>
    </View>
  );
}