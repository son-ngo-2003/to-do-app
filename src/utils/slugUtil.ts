function slugInclude(slug: string, search: string): boolean {
    const words : string[] = slug.split(' ').map(word => word.trim().toLowerCase());
    const searchWords : string = search.toLowerCase();
    return words.some(word => word.includes(searchWords));
}

export {
    slugInclude
}