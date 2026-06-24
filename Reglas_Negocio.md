**Reglas del Negocio que el flujo no explica con exactitud:** 

1\. Fecha\_Fin de Familiar en caso de no ser nula su valor será la fecha en la cual sus beneficios lleguen a su fin o que el personal de la UCAB relacionado sea deshabilitado de la base de datos(Despedido o algo parecido). 

2.El cálculo del precio institucional del servicio dependerá de la entidad que lo publica(junto a la sede) y quien lo solicita, variando el precio dependiendo de qué persona solicite el servicio. 

3\. Cada servicio puede o no tener requisitos para su utilización de parte de algún miembro, el sistema evaluará que el miembro solicitante cumpla los requisitos a que puede ser a través de documentos, encuestas, etc… 

4\. La hora\_Fin de la entidad Historial\_Sesiones será distinta de nulo e igual a la hora en la que el Miembro cierre sesión. 

5\. El sistema puede ejecutar un cierre masivo de estados de cuenta al final de cada mes, convirtiendo todos los folios de consumo pendientes en facturas formales de manera simultánea. 

6.El sistema sabe determinar el tiempo total de resolución de una solicitud al recibir su identificador, restando el momento de cierre del momento de apertura y descontando automáticamente los fines de semana o feriados institucionales. 

7\. El sistema debe verificar los intervalos de los Históricos de Reservas para evitar colisiones entre sus horas inicio y hora fin si coinciden el mismo día y espacio físico.  
**Restricciones Del Modelo ERE:** 

1.Fecha\_Fin de la entidad **Miembro\_Vinculacion** en caso de no ser nula es igual a otra fecha\_Inicio en la que ocurre un cambio. 

(∀ m | Miembro\_Vinculacion(m) : (∃ m’| Miembro\_Vinculacion(m’) ∧ m’.Expediente\_Unico= m.Expediente\_Unico) ⇒ (m.Fecha\_Fin \= m’.Fecha\_Inicio))) 

2\. No puede existir un familiar de cargo menor con edad mayor a 18 

(∀ f | Familiar(f) : ¬(∃ c | Cargo\_Menor(c) : (IS.A(f,c).edad \>=18 ))) 

3\. No puede existir un familia de cargo mayor con edad menor a 18 

(∀ f | Familiar(f) : ¬(∃ c | Cargo\_Mayor(c) : (IS.A(f,c).edad \<= 18))) 

4\. para toda entidad prestadora, no puede tener un ajuste mayor o menor a lo establecido por la sede en la relación opera 

(∀ e | Entidad\_prestadora(e) : ¬(∃ o | opera(o) ^ o\[Entidad\_Prestadora\]=e : (e.ajuste \> o.tarifa\_max) v (e.ajuste \< 0.tarifa min))) 

5.Fecha\_Fin de la entidad Historial\_Sesiones es igual a otra fecha\_Inicio en la que ocurre un cambio. 

(∀ h | Historial\_Sesiones(h) : (∃ h’|Historial\_Sesiones(h’) ∧ h’.Expediente\_Unico= h.Expediente\_Unico) ⇒ (m.Fecha\_Fin \= m’.Fecha\_Inicio)))  
6\. Para todo miembro su **Total\_Sesiones** de la entidad Miembro es igual a la cantidad de relaciones existentes entre la entidad Miembro y Historial\_Sesiones. 

(∀ m| Miembro(m):( \+∃ o| Obtiene(o) ^ o\[Miembro\]=m :(∃h| Historial\_Sesiones(h) ^ o\[Historial\_Sesiones\]=h))= m.Total\_Sesiones) 

7.Para todo **Folio\_Consumo** El precio unitario tomado del historial de tarifas en la fecha exacta del cargo. 

(∀ c | Folio\_cosumo(c) : ( ∃ a | Asociado(a) ^ a\[Folio\_cosumo\] \= c ^ ( ∃ f | Folio(f) ^ a\[Folio\] \= f ^ (∃ b | Abre(a) ^ b\[Folio\] \= f ^ (∃ s | Solicitud\_servicio(s) \= b\[Solicitud\_servicio\] \= s ^ (∃ c | Cuenta(c) ^ c\[Solicitud\_servicio\] \= s (∃ e | Servicio(e) ^ c\[Servicio\] \= e ^ (∃ m | Mantiene(m) ^ m\[Servicio\]=e ^ (∃ h | Historico\_tarifas(h) ^ m\[Historico\_tarifas\]= h)))))))) ⇒ (c.Precio\_unitario \= h.Tarifa\_precio)) 

8\. Para todo Miembro que cambie su contraseña la Fecha\_Fin de la entidad Historial\_Contraseña será igual a la Fecha\_Inicio en la que ocurre el cambio de contraseña relacionado al mismo Miembro. 

(∀ m| Miembro(m):(∃ m’|Miembro(m’) ^ m’.ID\_Miembro=m.ID\_Miembro: (∃ t| Tiene(t) ^ t\[Miembro\]=m ^ t\[Miembro\]=m’: (∃ h| Historial\_Sesiones(h)^ t\[Historial\_Sesiones\]=h: m’.Fecha\_Inicio=m.Fecha\_Fin) ) ) ) 

9\. No existe una reserva cuyo **Historial\_Reservas** coincida por completo con otra misma reserva. 

(∀ s,e|Servicio(s) ^ Espacio\_Fisico(e): ¬(∃ r, r’| Reserva(r) ^ Reserva(r’): (IS.A(s,r).ID\_Servicio≠ IS.A(s,r’).ID\_Servicio) ^ (∃ a, a’| Anota(a) ^ Anota(a’) ^ a\[Reserva\]=r ^ a’\[Reserva\]=r’ ^ a\[Espacio\_Fisico\]=e ^ a’\[Espacio\_Fisico\]=e : (∃ h, h’| Historial\_Reservas(h) ^ Historial\_Reservas(h’) ^ a\[Historial\_Reservas\]=h ^ a’\[Historial\_Reservas\]=h’: h.Fecha\_Reserva \= h’.Fecha\_Reserva ^ 

h.Hora\_Inicio=h’.Hora\_Inicio ^ h.hora\_Fin \= h’.Hora\_Fin ) ) ) ) 

10\. El monto total de un **Folio** debe ser igual al sumar todos los precios asociados de los items\_consumo de ese folio. 