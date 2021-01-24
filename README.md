# ldpos-knex-dal
Knex Data Access Layer for LDPoS.

## Starting postgres
- Install [docker-engine](https://docs.docker.com/engine/install/) or [docker-desktop](https://docs.docker.com/docker-for-windows/install/)
- Make sure docker command is available on the path.
- Run ```docker-compose up```
- Type ```ctrl+c``` or ```docker-compose down``` to stop the server
- Visit ```localhost:8081``` for pgadmin interface.
- Login using creds specified in ```docker-compose.yml``` file under pgadmin service.
- Click ```Add New Server``` -> General Tab -> Name = Test-Server
- Click ```Connection``` tab -> Host name/address = postgres_db -> Port = 5432 -> Maintenance database = neutral
- Copy creds for login from ```docker-compose.yml``` file under db service
