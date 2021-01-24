# ldpos-knex-dal
Knex Data Access Layer for LDPoS.

## Install docker
- Install [docker-engine](https://docs.docker.com/engine/install/) or [docker-desktop](https://docs.docker.com/docker-for-windows/install/)
- Make sure docker command is available on the path.

## Starting postgres
- Run ```docker-compose up db```
- Type ```ctrl+c```, ```docker-compose stop db```, ```docker-compose rm db```to stop & remove old db instance.

## Starting pgadmin
- Run ```docker-compose up pgadmin```
- Visit ```localhost:8081``` for pgadmin interface.
- Login using creds specified in ```docker-compose.yml``` file under pgadmin service.
- Click ```Add New Server``` -> General Tab -> Name = Test-Server
- Click ```Connection``` tab -> Host name/address = postgres_db -> Port = 5432 -> Maintenance database = neutral
- Copy creds for login from ```docker-compose.yml``` file under db service

## Working with database migrations
- Create migration using ```yarn migrate:make migrration_name``` e.g. ```yarn migrate:make create_table_table_name```
- Set migration names descriptive, follow ```snake case``` for migration name and table names (column names can be kept camelCase).
- To run migration against db, run 
```shell script
    yarn migrate
```
- To rollback migration
```shell script
    yarn migrate:rollback
```

## Creating seeds
- Create migration using ```yarn seed:make seed_name``` e.g. ```yarn seed:make accounts```
- follow ```snake case``` for seeds and seed name is usually table name.
- To run seeds against db, run 
```shell script
    yarn seed
```
