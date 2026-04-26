const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header>Header Placeholder</header>
      <main>{children}</main>
      <footer>Footer Placeholder</footer>
    </div>
  );
};

export default MainLayout;  // ← This line is CRITICAL