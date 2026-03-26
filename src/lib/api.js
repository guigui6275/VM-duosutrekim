import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchAPI(path, params = {}) {
  const query = qs.stringify(params, { encodeValuesOnly: true });
  const url = `${STRAPI_URL}/api${path}${query ? `?${query}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}

export async function getArtistes() {
  return fetchAPI('/artistes', { populate: '*' });
}

export async function getArtiste(slug) {
  return fetchAPI('/artistes', {
    filters: { slug: { $eq: slug } },
    populate: '*'
  });
}

export async function getAlbums(artisteSlug = null) {
  const params = { populate: '*', sort: ['date_sortie:desc'] };
  if (artisteSlug) {
    params.filters = { artistes: { slug: { $eq: artisteSlug } } };
  }
  return fetchAPI('/albums', params);
}

export async function getConcerts(artisteSlug = null, aVenir = true) {
  const params = {
    populate: '*',
    sort: aVenir ? ['date:asc'] : ['date:desc'],
    filters: { passe: { $eq: !aVenir } }
  };
  if (artisteSlug) {
    params.filters.artistes = { slug: { $eq: artisteSlug } };
  }
  return fetchAPI('/concerts', params);
}

export async function getActualites(artisteSlug = null) {
  const params = { populate: '*', sort: ['date_publication:desc'] };
  if (artisteSlug) {
    params.filters = { artistes: { slug: { $eq: artisteSlug } } };
  }
  return fetchAPI('/actualites', params);
}

export async function getRevues(artisteSlug = null) {
  const params = { populate: '*', sort: ['date:desc'] };
  if (artisteSlug) {
    params.filters = { artistes: { slug: { $eq: artisteSlug } } };
  }
  return fetchAPI('/revues', params);
}