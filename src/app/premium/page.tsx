export default function PremiumPage() {
  return (
    <div className="card">
      <h2>Rádio Premium</h2>
      <p>Assine para remover anúncios e desbloquear recursos extras.</p>
      <a href="#" onClick={(e)=>{e.preventDefault(); alert('Em breve: cole aqui o seu Stripe Checkout Link.');}} style={{ display:'inline-block', marginTop:8 }}>Assine Premium</a>
    </div>
  );
}
