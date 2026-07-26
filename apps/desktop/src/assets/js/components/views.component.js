// Compose Views from modular View Modules
const ViewsComponent = [
  PersonalViews,
  VideoToolsViews,
  AutomationViews,
  SocialAccountsViews,
  SystemAdminViews
].join('\n');

function renderViews() {
  const root = document.getElementById('views-root');
  if (root) {
    root.outerHTML = '<div class="main-content">' + ViewsComponent + '</div>';
  }
}
