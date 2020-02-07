superAdmin = (req, res, next) => {
  if(req.user.admin.isSuperAdmin == false)
  return res.status(403).send({message: 'Access Denied.'})
  next()
}

module.exports = superAdmin;