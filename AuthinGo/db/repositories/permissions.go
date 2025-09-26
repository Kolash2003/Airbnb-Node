package db

import (
	"AuthinGo/models"
	"database/sql"
	"fmt"
)

type PermissionRepository interface {
	GetPermissionById(id int64) (*models.Permissions, error)
	GetPermissionByName(name string) (*models.Permissions, error)
	GetAllPermissions() ([] *models.Permissions, error)
	CreatePermission(name string, description string, resource string, action string) (*models.Permissions, error)
	DeletePermissionById(id int64) error
	UpdatePermission(id int64, name string, description string, resource string, action string) (*models.Permissions, error)
}

type PermissionRepositoryImpl struct {
	db *sql.DB
}

func NewPermissionRepository(_db *sql.DB) PermissionRepository {
	return &PermissionRepositoryImpl{
		db: _db,
	}
}

func (p *PermissionRepositoryImpl) GetPermissionById(id int64) (*models.Permissions, error) {
	query := `select id, name, description, resource, action, created_at, updated_at from permissions where id = ?`

	row := p.db.QueryRow(query, id)

	permission := &models.Permissions{}

	if err := row.Scan(&permission.Id, &permission.Name, &permission.Description, &permission.Resource, &permission.Action, &permission.CreatedAt, &permission.UpdatedAt); err != nil {
		return nil, err
	}

	return permission, nil
}

func (p *PermissionRepositoryImpl) GetPermissionByName(name string) (*models.Permissions, error) {
	query := `select id, name, description, resource, action, created_at, updated_at from permissions where name = ?`

	row := p.db.QueryRow(query, name)

	permission := &models.Permissions{}

	if err := row.Scan(&permission.Id, &permission.Name, &permission.Description, &permission.Resource, &permission.Action, &permission.CreatedAt, &permission.UpdatedAt); err != nil {
		return nil, err
	}

	return permission, nil
}

func (p *PermissionRepositoryImpl) GetAllPermissions() ([] *models.Permissions, error) {
	query := `select * from permissions`

	rows, err := p.db.Query(query)

	if err != nil {
		fmt.Println("Error in querying values from the db")
		return nil, err
	}
	defer rows.Close()

	var permissions []*models.Permissions

	for rows.Next() {
		var p models.Permissions
		err := rows.Scan(&p.Id, &p.Name, &p.Description, &p.Resource, &p.Action, &p.CreatedAt, &p.UpdatedAt)

		if err != nil {
			fmt.Println("Error in printing data", err)
			return nil, err
		}

		permissions = append(permissions, &p)
	}

	err = rows.Err()

	if err != nil {
		fmt.Println("Error in printing the values")
		return nil, err
	}

	return permissions, nil

}

func (p *PermissionRepositoryImpl) CreatePermission(name string, description string, resource string, action string) (*models.Permissions, error) {
	query := `insert into permissions (name, description, resource, action, created_at, updated_at) values (?, ?, ?, ?, NOW(), NOW())`

	result, err := p.db.Exec(query, name, description, resource, action)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()

	if err != nil {
		return nil, err
	}

	return &models.Permissions{
		Id:				id,
		Name:       	name,
		Description: 	description,
		Resource: 		resource,
		Action: 		action,
		CreatedAt: 		"",
		UpdatedAt:      "",		
	}, nil
}

func (p *PermissionRepositoryImpl) DeletePermissionById(id int64) error {
	query := ` delete from permissions where id = ?`

	result, err := p.db.Exec(query, id)

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

func (p *PermissionRepositoryImpl) UpdatePermission(id int64, name string, description string, resource string, action string) (*models.Permissions, error) {
	query := `update permissons set name = ?, description = ?, resource = ?, action = ? updated_at = NOW() where id = ?`

	_, err := p.db.Exec(query, name, description, resource, action, id)

	if err != nil {
		return  nil, err
	}

	return &models.Permissions{
		Id: 				id,
		Name: 				name,
		Description: 		description,
		Resource: 			resource,
		Action: 			action,
		CreatedAt: 			"",
		UpdatedAt: 			"",
	}, nil
}