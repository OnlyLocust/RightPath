export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mt-8 pt-8 border-t border-background/20 text-center text-background/70 text-sm">
          <p>&copy; 2025 RightPath Technologies Pvt. Ltd. All Rights Reserved. Surat, Gujarat, India.</p>
          <p className="mt-2">
            UserID: <span id="user-id-display">demo-user-123</span> | Secure, anonymous session
          </p>
        </div>
      </div>
    </footer>
  )
}
