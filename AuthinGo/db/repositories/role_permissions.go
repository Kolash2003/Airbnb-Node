package db

import (
	"AuthinGo/models"
	"database/sql"
	"time"
)

type RolePermissionRepository interface {
	GetRolePermissionById(id int64) (*models.RolePermission, error)
	GetRolePermissionByroleId(roleId int64) ([]*models.RolePermission, error)
	AddPermissionToRole(roleId int64, permissionId int64) (*models.RolePermission, error)
	RemovePermissionFromRole(roleId int64, permissionId int64) error
	GetAllRolePermissions() ([]*models.RolePermission, error)
}

type RolePermissionRepositoryImpl struct {
	db *sql.DB
}

func NewRolePermissionRepository(_db *sql.DB) RolePermissionRepository {
	return &RolePermissionRepositoryImpl{
		db: _db,
	}
}

func (r *RolePermissionRepositoryImpl) GetRolePermissionById(id int64) (*models.RolePermission, error) {
	query := `select id, role_id, permission_id, created_at, updated_at from role_permissions where id = $1`

	row := r.db.QueryRow(query, id)

	rolePermission := &models.RolePermission{}
	if err := row.Scan(&rolePermission.Id, &rolePermission.RoleId, &rolePermission.PermissionId, &rolePermission.CreatedAt, &rolePermission.UpdatedAt); err != nil {
		return nil, err
	}

	return rolePermission, nil
}

func (r *RolePermissionRepositoryImpl) GetRolePermissionByroleId(roleId int64) ([]*models.RolePermission, error) {
	query := `select id, role_id, permission_id, created_at, updated_at from role_permissions where role_id = $1`

	row, err := r.db.Query(query, roleId)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	var rolePermissions []*models.RolePermission
	for row.Next() {
		rolePermission := &models.RolePermission{}
		if err := row.Scan(&rolePermission.Id, &rolePermission.RoleId, &rolePermission.PermissionId, &rolePermission.CreatedAt, &rolePermission.UpdatedAt); err != nil {
			return nil, err
		}
		rolePermissions = append(rolePermissions, rolePermission)
	}

	if err := row.Err(); err != nil {
		return nil, err
	}

	return rolePermissions, nil
}

func (r *RolePermissionRepositoryImpl) AddPermissionToRole(roleId int64, permissionId int64) (*models.RolePermission, error) {
	query := `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING id`
	var id int64
	err := r.db.QueryRow(query, roleId, permissionId).Scan(&id)
	if err != nil {
		return nil, err
	}

	return &models.RolePermission{
		Id: 	id,
		RoleId: roleId,
		PermissionId: permissionId,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

func (r *RolePermissionRepositoryImpl) RemovePermissionFromRole(roleId int64, permissionId int64) error {
	query := `DELETE FROM role_permissions where role_id = $1 AND permission_id = $2`
	result, err := r.db.Exec(query, roleId, permissionId)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *RolePermissionRepositoryImpl) GetAllRolePermissions() ([]*models.RolePermission, error) {
	query := `select id, role_id, permission_id, created_at, updated_at from role_permissions`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rolePermissions []*models.RolePermission
	for rows.Next() {
		rolePermission := &models.RolePermission{}
		if err := rows.Scan(&rolePermission.Id, &rolePermission.RoleId, &rolePermission.PermissionId, &rolePermission.CreatedAt, &rolePermission.UpdatedAt); err != nil {
			return nil, err
		}
		rolePermissions = append(rolePermissions, rolePermission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rolePermissions, nil
}



