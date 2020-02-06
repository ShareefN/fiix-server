superAdmin = (req, res, next) => {
  console.log(req.user.admin.isSuperAdmin)
  if(req.user.admin.isSuperAdmin == false)
  return res.status(403).send({message: 'Access Denied.'})
  next()
}

module.exports = superAdmin;