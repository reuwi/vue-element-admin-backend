import { Entity, Tree, TreeParent, TreeChildren, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm'
import { Role } from './role'

@Entity()
@Tree('materialized-path')
export class Route {
  @PrimaryGeneratedColumn()
  public id: number

  @TreeParent()
  public parent: Route

  @TreeChildren({ cascade: true })
  public children: Route[]

  @Column({
    default: 0
  })
  public order: number

  @Column({
    length: 80
  })
  public path: string

  @Column({
    nullable: true,
    length: 80
  })
  public name: string

  @Column({
    nullable: true,
    length: 80
  })
  public redirect: string

  @Column({
    nullable: true,
    length: 80
  })
  public component: string

  @Column({
    default: false
  })
  public hidden: boolean

  @Column({
    nullable: true,
    length: 80
  })
  public title: string

  @Column({
    nullable: true,
    length: 80
  })
  public icon: string

  @Column({
    default: false
  })
  public noCache: boolean

  @Column({
    default: false
  })
  public affix: boolean

  @ManyToMany(type => Role, role => role.routes)
  @JoinTable()
  public roles: Role[]
}