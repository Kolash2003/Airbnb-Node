package services

import (
	repositories "AuthinGo/db/repositories"
	"AuthinGo/models"
)

type RoleService interface {
	GetRoleById(id int64) (*models.Role, error)
	GetRoleByName(name string) (*models.Role, error)
	GetAllRoles() ([]*models.Role, error)
	CreateRole(name string, description string) (*models.Role, error)
	DeleteRoleById(id int64) error
	UpdateRole(id int64, name string, description string) (*models.Role, error)
	GetRolePermissions(roleId int64) ([]*models.RolePermission, error)
	AddPermissionToRole(roleId int64, permissionId int64) (*models.RolePermission, error)
	RemovePermissionFromRole(roleId int64, permissionId int64) error
	GetAllRolePermissions() ([]*models.RolePermission, error)
	AssignRoleToUser(userId int64, roleId int64) error
}

type RoleServiceImpl struct {
	rolesRepository repositories.RoleRepository
	userRoleRepository repositories.UserRoleRepository
	rolePermissionRepository repositories.RolePermissionRepository
}

func NewRoleService(_roleRepository repositories.RoleRepository, _userRepository repositories.UserRoleRepository, _rolePermissionRepository repositories.RolePermissionRepository) RoleService {
	return &RoleServiceImpl{
		rolesRepository: _roleRepository,
		userRoleRepository: _userRepository,
		rolePermissionRepository: _rolePermissionRepository,
	}
}

func (r *RoleServiceImpl) GetRoleById(id int64) (*models.Role, error) {
	return r.rolesRepository.GetRoleById(id)
}

func (r *RoleServiceImpl) GetRoleByName(name string) (*models.Role, error) {
	return r.rolesRepository.GetRoleByName(name)
}

func (r *RoleServiceImpl) GetAllRoles() ([]*models.Role, error) {
	return r.rolesRepository.GetAllRoles()
}

func (r *RoleServiceImpl) CreateRole(name string, description string) (*models.Role, error) {
	return r.rolesRepository.CreateRole(name, description)
}

func (r *RoleServiceImpl) DeleteRoleById(id int64) error {
	return r.rolesRepository.DeleteRoleById(id)
}

func (r *RoleServiceImpl) UpdateRole(id int64, name string, description string) (*models.Role, error) {
	return r.rolesRepository.UpdateRoleBy(id, name, description)
}

func (r *RoleServiceImpl) GetRolePermissions(roleId int64) ([]*models.RolePermission, error) {
	return r.rolePermissionRepository.GetRolePermissionByroleId(roleId)
}

func (r *RoleServiceImpl) AddPermissionToRole(roleId int64, permissionId int64) (*models.RolePermission, error) {
	return r.rolePermissionRepository.AddPermissionToRole(roleId, permissionId)
}

func (r *RoleServiceImpl) RemovePermissionFromRole(roleId int64, permissionId int64) error {
	return r.rolePermissionRepository.RemovePermissionFromRole(roleId, permissionId)
}

func (r *RoleServiceImpl) GetAllRolePermissions() ([]*models.RolePermission, error) {
	return r.rolePermissionRepository.GetAllRolePermissions()
}

func (r *RoleServiceImpl) AssignRoleToUser(userId int64, roleId int64) error {
	return r.userRoleRepository.AssignRoleToUser(userId, roleId)
}

