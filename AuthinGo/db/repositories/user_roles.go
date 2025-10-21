package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
	"strings"
)

type UserRoleRepository interface {
	GetUserRoles(userId int64) ([] *models.Role, error)
	AssignRoleToUser(userId int64, roleId int64) error
	RemoveRoleFromUser(userId int64, roleId int64) error
	GetUserPermissions(UserId int64) ([] *models.Permissions, error)
	HasPermissions(userId int64, permissionName string) (bool, error)
	HasRole(userId int64, roleName string) (bool, error)
	HasAllRoles(userId int64, roleNames []string) (bool, error)
	HasAnyRole(userId int64, roleNames []string) (bool, error)
}

type UserRoleRepositoryImpl struct {
	db *sql.DB
}

func NewUserRoleRepository(_db *sql.DB) UserRoleRepository {
	return &UserRoleRepositoryImpl{
		db: _db,
	}
}

func (u *UserRoleRepositoryImpl) GetUserRoles(id int64) ([] *models.Role, error) {
	query := `select r.id, r.name, r.description, r.created_at, r.updated_at 
	from user_roles ur INNER JOIN 
	roles r ON ur.role_id = r.id where ur.user_id = ?`

	rows, err := u.db.Query(query, id)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var roles []*models.Role
	for rows.Next() {
		role := &models.Role{}

		if err := rows.Scan(&role.Id, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt); err != nil {
			return nil, err
		}

		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (u *UserRoleRepositoryImpl) AssignRoleToUser(id int64, roleId int64) error {
	query := `insert into user_roles (user_id, role_id) values (?, ?)`
	_, err := u.db.Exec(query, id, roleId)
	if err != nil {
		return err
	}
	return nil
} 

func (u *UserRoleRepositoryImpl) RemoveRoleFromUser(userId int64, roleId int64) error {
	query := `delete from user_roles where user_id = ? and role_id = ?`
	_, err := u.db.Exec(query, userId, roleId)

	if err != nil {
		return err
	}
	
	return nil
}

func (u *UserRoleRepositoryImpl) GetUserPermissions(userId int64) ([] *models.Permissions, error) {
	query := `select p.id, p.name, p.description, p.resource, p.action 
	from role_permissions rp INNER JOIN  user_roles ur ON rp.role_id = ur.role_id
	INNER JOIN permissions p ON rp.permission_id = p.id
	where ur.user_id = ?`

	rows, err := u.db.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*models.Permissions
	for rows.Next() {
		permission := &models.Permissions{}
		if err := rows.Scan(&permission.Id, &permission.Name, &permission.Description, &permission.Resource, &permission.Action, &permission.CreatedAt, &permission.UpdatedAt); err != nil {
			return  nil, err
		}
		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	
	return permissions, nil
}

func (u *UserRoleRepositoryImpl) HasPermissions(userId int64, permissionName string) (bool, error) {
	query := `select count(*) > 0 
	from user_roles ur INNER JOIN 
	role_permissions rp ON ur.role_id = rp.role_id
	INNER JOIN permissions p ON rp.permission_id = p.id
	where u.user_id = ? AND p.name = ?	`

	var exists bool

	err := u.db.QueryRow(query, userId, permissionName).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

func (u *UserRoleRepositoryImpl) HasRole(userId int64, roleName string) (bool, error) {
	query := `select count(*) > 0
	from user_roles ur INNER JOIN roles r
	ON ur.role_id = r.id WHERE ur.user_id = ? and r.name = ?`
	var exists bool
	err := u.db.QueryRow(query, userId, roleName).Scan(&exists)

	if err != nil {
		return false, err
	}
	
	return exists, nil
}

func (u *UserRoleRepositoryImpl) HasAllRoles(userId int64, roleNames []string) (bool ,error) {
	
	if len(roleNames) == 0 {
		return true, nil // if no roles are specified, return true
	}

	query := `select count(*) = ?
	from user_roles ur 
	INNER JOIN roles r ON ur.role_id = r.id
	WHERE ur.user_id = ? AND r.name IN (?)
	GROUP BY ur.user_id`

	roleNameStr := strings.Join(roleNames, ",")

	row := u.db.QueryRow(query, len(roleNames), userId, roleNameStr)

	var HasAllRoles bool
	if err := row.Scan(&HasAllRoles); err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return HasAllRoles, nil
}

func (u *UserRoleRepositoryImpl) HasAnyRole(userId int64, roleNames []string) (bool, error) {

	if len(roleNames) == 0 {
		return true, nil
	}
	placeholders := strings.Repeat("?,", len(roleNames))
	placeholders = placeholders[:len(placeholders)-1]
	query := fmt.Sprintf(`select count(*) > 0 FROM user_roles ur INNER JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ? AND r.name IN (%s)`, placeholders)

	// roleNameStr := utilities.FormatRoles(roleNames)

	args := make([]interface{}, 0, 1+len(roleNames))
	args = append(args, userId)
	for _, roleName := range roleNames {
		args = append(args, roleName)
	}

	row := u.db.QueryRow(query, args...)

	var HasAnyRole bool
	if err := row.Scan(&HasAnyRole); err != nil {
		if err == sql.ErrNoRows {
			return false, nil // No roles found for the user
		}
		return false, err // Return any other error
	}

	fmt.Println("hasAnyRole", HasAnyRole)
	return HasAnyRole, nil
}