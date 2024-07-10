export function paginate(page, size) {
    if (!size || size <= 0) {
        size = 1
    }
    if (!page || page <= 0) {
        page = 1
    }
    const limit = size
    const skip = (parseInt(page) - 1) * parseInt(size)
    return { skip, limit }
}