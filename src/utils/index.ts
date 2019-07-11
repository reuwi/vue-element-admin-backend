export function flat2tree(flat: any[], options: { id; parentId; order } = {
  id: 'id',
  parentId: 'parentId',
  order: 'order'
}) {
  const defaultProps = {
    id: 'id',
    parentId: 'parentId',
    order: 'order'
  }
  const defaultOpts = {
    props: defaultProps,
    sort: true
  }
  const finallyOptions = Object.assign(defaultOpts, options)
  const { sort } = finallyOptions

  const obj = flat.reduce((obj, item) => {
    obj[item.id] = item
    return obj
  }, {})
  const tree = flat.reduce((result, item) => {
    if (item.parentId) {
      if (obj[item.parentId].children) {
        // 如果children数组中不存在相同id的item,则pushitem到children中去,否则不push
        obj[item.parentId].children.push(item)
        // 根据order字段排序
        sort && obj[item.parentId].children.sort((a, b) => a.order - b.order)
      } else {
        obj[item.parentId].children = [item]
      }
    } else {
      /* eslint-disable-next-line no-param-reassign */
      result = result.concat(item)
    }
    return result
  }, [])

  // 根据order字段排序
  if (sort) {
    return tree.sort((a, b) => a.order - b.order)
  } else {
    return tree
  }
}