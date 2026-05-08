import LoginForm from "../components/LoginForm";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function DangNhap() {
  return (
    <AuthSplitLayout>
      <div className="auth-split-card animate-scale-in">
        <LoginForm />
      </div>
    </AuthSplitLayout>
  );
}
