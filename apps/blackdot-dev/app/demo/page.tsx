export default function DemoPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Demo Page</h1>
      <p>Theme variant switcher demo</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>Theme Variants Available</h2>
        <ul>
          <li>minimal - Professional, clean</li>
          <li>vibrant - Bold, colorful</li>
          <li>neon - Cyberpunk, gaming</li>
          <li>arctic - Cool blues</li>
          <li>sunset - Warm oranges</li>
          <li>forest - Natural greens</li>
          <li>midnight - Cosmic purples</li>
          <li>mist - Soft grays</li>
          <li>monochrome - Black/white</li>
        </ul>
      </div>
    </main>
  );
}
