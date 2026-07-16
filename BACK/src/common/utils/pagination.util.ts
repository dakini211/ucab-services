import { Prisma } from '@prisma/client';

export interface ListaParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
}

export interface PaginaResultado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginado + busqueda + ordenamiento del lado del SERVIDOR.
 *
 * Mantiene el mismo contrato que ServicioService.findAll y
 * EdificacionService.findAll: { data, total, page, limit, totalPages }.
 * El frontend (MiembrosComponent, EspaciosFisicosComponent) ya consume ese
 * formato, asi que la pagina de finanzas no necesita nada distinto.
 *
 * SEGURIDAD - IMPORTANTE:
 * ORDER BY no acepta parametros ($1) en PostgreSQL: la columna se interpola
 * como texto con Prisma.raw(), que por diseño NO escapa nada. Por eso jamas se
 * usa directamente lo que manda el cliente: se busca en una lista blanca que
 * mapea el nombre publico del campo a una expresion SQL fija. Si el cliente
 * manda cualquier otra cosa, cae al orden por defecto.
 *
 * Sin esta lista blanca, ?sortBy=... seria una inyeccion SQL directa.
 */
export function resolverOrden(
  allowedSort: Record<string, string>,
  defaultSort: string,
  sortBy?: string,
  order?: string,
): { sortSql: Prisma.Sql; orderSql: Prisma.Sql; sortBy: string; order: string } {
  const campo =
    sortBy && Object.prototype.hasOwnProperty.call(allowedSort, sortBy)
      ? sortBy
      : defaultSort;

  const dir = String(order ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  return {
    sortSql: Prisma.raw(allowedSort[campo]),
    orderSql: Prisma.raw(dir),
    sortBy: campo,
    order: dir.toLowerCase(),
  };
}

/** Normaliza page/limit y calcula el offset. */
export function resolverPaginado(
  page?: number,
  limit?: number,
  maxLimit = 100,
): { page: number; limit: number; offset: number } {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(maxLimit, Math.max(1, Number(limit) || 10));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * Arma la respuesta paginada a partir de filas que traen total_registros.
 *
 * El total viaja en cada fila gracias a COUNT(*) OVER() en la consulta: asi se
 * obtiene el conteo y la pagina en UN solo viaje a la base de datos, en vez de
 * dos consultas separadas como haria un findMany + count.
 */
export function armarPagina<T extends Record<string, any>>(
  rows: T[],
  page: number,
  limit: number,
): PaginaResultado<Omit<T, 'total_registros'>> {
  const total = rows.length > 0 ? Number(rows[0].total_registros) : 0;

  const data = rows.map((row) => {
    const { total_registros, ...rest } = row;
    return rest;
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
