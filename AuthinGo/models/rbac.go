package models

import "time"

type Role struct {
	Id				int64	
	Name			string
	Description		string
	CreatedAt		time.Time
	UpdatedAt		time.Time
}

type Permissions struct {
	Id			int64
	Name		string
	Description	string
	Resource	string
	Action		string
	CreatedAt	time.Time
	UpdatedAt	time.Time
}

type RolePermission struct {
	Id				int64
	RoleId			int64
	PermissionId	int64
	CreatedAt		time.Time
	UpdatedAt		time.Time
}