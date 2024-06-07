import { Entity, ManyToOne, MikroORM, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/sqlite';

@Entity()
class Workspace {
  @PrimaryKey()
  sid!: number;
}

@Entity()
class Project {
  @PrimaryKey()
  sid!: number;

  @ManyToOne(() => Workspace)
  workspace!: Workspace;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [Project, Workspace],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  orm.em.create(Workspace, { sid: 1 });
  await orm.em.flush();
  orm.em.clear();

  const workspace = orm.em.getReference(Workspace, { sid: 1 });

  orm.em.create(Project, { sid: 1, workspace });
  orm.em.create(Project, { sid: 2, workspace });
  await orm.em.flush();
  orm.em.clear();

  const projects = await orm.em.findAll(Project, {
    fields: ['workspace.sid'],
    orderBy: { workspace: 'ASC' },
  });

  console.log(projects.map(it => it.workspace.sid));
});
