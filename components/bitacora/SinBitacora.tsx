import { CerrarSesion } from "@/components/ui/CerrarSesion";

/**
 * Mensaje común cuando el módulo existe pero no hay bitácora para esta empresa.
 *
 * Lleva salida de sesión porque esta pantalla era un callejón sin salida: no
 * tenía un solo enlace, y la causa más frecuente de llegar aquí es haber
 * entrado con la cuenta equivocada —justo el caso en que lo único útil es
 * poder salir y entrar con la otra.
 */
export function SinBitacora() {
  return (
    <div className="portada">
      <div className="tarjeta-sesion">
        <h1>Este módulo no está abierto para tu empresa</h1>
        <p className="sub">
          Puede que todavía no haya empezado, o que tu cuenta no esté vinculada a la
          cohorte. Quien coordina el programa puede revisarlo.
        </p>
        <div style={{ marginTop: 14 }}><CerrarSesion /></div>
      </div>
    </div>
  );
}
