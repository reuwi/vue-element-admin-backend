import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm'
import { Route } from './route'
import { Role } from './role'

@Entity()
export class RouteMeta {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({
    length: 80
  })
  public title: string

  @Column({
    length: 80
  })
  public icon: string

  @Column()
  public noCache: boolean

  @Column()
  public affix: boolean

  @OneToOne(type => Route, route => route.meta)
  @JoinColumn()
  public route: Route

  @ManyToMany(type => Role, role => role.routeMeta)
  @JoinTable()
  public roles: Role[]
}