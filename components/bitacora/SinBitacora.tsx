/** Mensaje común cuando el módulo existe pero no hay bitácora para esta empresa. */
export function SinBitacora() {
  return (
    <div className="portada">
      <div className="tarjeta-sesion">
        <h1>Este módulo no está abierto para tu empresa</h1>
        <p className="sub">
          Puede que todavía no haya empezado, o que tu cuenta no esté vinculada a la
          cohorte. Quien coordina el programa puede revisarlo.
        </p>
      </div>
    </div>
  );
}
