export function formatRole(role) {
  return role ? role.replace('-', ' ') : '';
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}
