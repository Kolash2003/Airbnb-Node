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
}

type RoleServiceImpl struct {
	rolesRepository repositories.RoleRepository
	RolePermissionRepository repositories.RolePermissionRepository
}

func NewRoleService(_roleRepository repositories.RoleRepository) RoleService {
	return &RoleServiceImpl{
		rolesRepository: _roleRepository,
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
	return r.RolePermissionRepository.GetRolePermissionByroleId(roleId)
}

func (r *RoleServiceImpl) AddPermissionToRole(roleId int64, permissionId int64) (*models.RolePermission, error) {
	return r.RolePermissionRepository.AddPermissionToRole(roleId, permissionId)
}