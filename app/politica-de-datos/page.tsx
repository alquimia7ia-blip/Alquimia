import Link from "next/link";

export const metadata = { title: "Política de tratamiento de datos · Bitácora MEGA" };

/**
 * Plantilla de la política, con los datos del responsable por completar.
 *
 * Deliberadamente marcada como borrador: publicarla como definitiva sin que
 * la revise la Cámara sería afirmar algo que no nos consta.
 */
export default function Politica() {
  return (
    <div className="portada" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <article className="tarjeta-sesion" style={{ maxWidth: 680 }}>
        <h1>Política de tratamiento de datos personales</h1>
        <p className="sub">Versión 2026-09-01 · Ley 1581 de 2012 y Decreto 1074 de 2015</p>

        <div className="hint" style={{ marginBottom: 18 }}>
          <b>Borrador.</b> Este texto debe revisarlo y adoptarlo formalmente la entidad
          responsable antes de abrir la plataforma a una cohorte real. Los campos entre
          corchetes están por completar.
        </div>

        <h3 style={{ fontSize: 15, marginTop: 18 }}>Responsable y encargado</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          El <b>responsable del tratamiento</b> es [entidad, NIT, dirección, correo de
          contacto para el ejercicio de derechos]. El <b>encargado</b> que opera la
          plataforma es [entidad prestadora], bajo contrato de transmisión de datos.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 18 }}>Qué datos se recogen</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Nombre, cargo, correo y teléfono opcional de las personas participantes, y la
          información empresarial que cada empresa registra en sus talleres. No se recogen
          documentos de identidad, direcciones de residencia ni datos sensibles.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 18 }}>Para qué</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Para prestar el servicio de acompañamiento del programa: registrar las respuestas
          de los talleres, mostrar el avance a la empresa y a su facilitador, y generar los
          informes de entrega. Las respuestas de una empresa solo son visibles para su
          propio equipo y para el facilitador de su cohorte.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 18 }}>Transferencia internacional</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          La información se almacena en servidores ubicados en Estados Unidos. Colombia no
          ha declarado a ese país con nivel adecuado de protección, por lo que la
          transferencia se sustenta en la autorización expresa que cada titular otorga al
          crear su cuenta.
        </p>

        <h3 style={{ fontSize: 15, marginTop: 18 }}>Derechos del titular</h3>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Conocer, actualizar, rectificar y suprimir sus datos, y revocar la autorización.
          Las consultas se atienden en diez días hábiles y los reclamos en quince, contados
          desde su recepción, escribiendo a [correo de contacto].
        </p>

        <div className="pie-sesion"><Link href="/entrar">Volver</Link></div>
      </article>
    </div>
  );
}
