import LoginForm from "../components/LoginForm";
import AuthSplitLayout from "../components/AuthSplitLayout";

export default function Login() {
  return (
    <AuthSplitLayout>
      <div className="auth-split-card animate-scale-in">
        <LoginForm variant="full" />
      </div>
    </AuthSplitLayout>
  );
}
