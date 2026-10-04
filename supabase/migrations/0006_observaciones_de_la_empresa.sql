-- Observaciones del programa, escritas por la empresa.
--
-- `comentarios` nació para la retroalimentación del facilitador: solo él
-- podía escribir. Pero en la sesión el profesor habla y es la empresa la que
-- toma nota, y esa nota es parte de las conclusiones del módulo. Sin esto,
-- el recuadro de observaciones del tablero no tendría dónde guardar.
--
-- Se distingue quién escribió con una columna explícita en vez de deducirlo
-- de las membresías: deducirlo obligaría a consultar tablas que RLS puede
-- estar tapando, y una nota que aparece sin autor es peor que ninguna.

alter table comentarios
  add column if not exists origen text not null default 'empresa'
    check (origen in ('empresa', 'facilitador'));

-- Lo ya escrito por un facilitador queda marcado como tal.
update comentarios c set origen = 'facilitador'
where exists (select 1 from facilitadores_cohorte f where f.perfil_id = c.autor_id);

create policy comentarios_empresa_escribe on comentarios for insert
  to authenticated with check (
    autor_id = auth.uid()
    and origen = 'empresa'
    and exists (select 1 from bitacoras b
                where b.id = bitacora_id
                  and b.empresa_id in (select app.empresas_del_usuario()))
  );

create policy comentarios_empresa_edita on comentarios for update
  to authenticated
  using  (autor_id = auth.uid()
          and origen = 'empresa'
          and exists (select 1 from bitacoras b
                      where b.id = comentarios.bitacora_id
                        and b.empresa_id in (select app.empresas_del_usuario())))
  with check (autor_id = auth.uid() and origen = 'empresa');

create policy comentarios_empresa_borra on comentarios for delete
  to authenticated using (
    autor_id = auth.uid()
    and origen = 'empresa'
    and exists (select 1 from bitacoras b
                where b.id = comentarios.bitacora_id
                  and b.empresa_id in (select app.empresas_del_usuario()))
  );
