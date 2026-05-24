import FormDangNhap from "../components/FormDangNhap";
import BoCucChiaXacThuc from "../components/BoCucChiaXacThuc";

export default function DangNhap() {
  return (
    <BoCucChiaXacThuc>
      <div className="auth-split-card animate-scale-in">
        <FormDangNhap />
      </div>
    </BoCucChiaXacThuc>
  );
}
