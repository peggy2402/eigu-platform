'use client';

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProfileView({ user }: { user: User }) {
  return (
    <div className="profile-card">
      <div className="profile-field">
        <span className="field-label">Email</span>
        <span className="field-value">{user.email || '—'}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Vai trò</span>
        <span className="field-value">{user.role || '—'}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Đã xác thực</span>
        <span className="field-value">{user.isVerified ? 'Da xac thuc' : 'Chua xac thuc'}</span>
      </div>
      <div className="profile-field">
        <span className="field-label">Ngày tạo</span>
        <span className="field-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
      </div>
    </div>
  );
}
