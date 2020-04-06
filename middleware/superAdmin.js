superAdmin = async (req, res, next) => {
  if(req.user.admin.role === 'admin')
  return res.status(403).send({message: 'Access Denied.'})
  next()
}

module.exports = superAdmin;