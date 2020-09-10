import "reflect-metadata";
import { createConnection, getManager, getCustomRepository } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as logger from "morgan";
import { Routes } from "./routes";
import { User } from "./entity/User";
import { Photo } from "./entity/Photo";
import { PhotoMetadata } from "./entity/PhotoMetadata";
import { Category } from "./entity/Category";
import { Post } from "./entity/Post";
import { PostCategory } from "./entity/PostCat";
import { UserRepository } from "./repository/UserRepo";

createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use(logger('dev'));
    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next);
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);

            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3000);
    // insertnew photos
    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.views = 1;
    photo.isPublished = true;

    // create a photo metadata
    let metadata = new PhotoMetadata();
    metadata.height = 640;
    metadata.width = 480;
    metadata.compressed = true;
    metadata.comment = "cybershoot";
    metadata.orientation = "portait";
    metadata.photo = photo;
    // get entity repositories
    let photoRepository = connection.getRepository(Photo);
    let metadataRepository = connection.getRepository(PhotoMetadata);

    // first we should save a photo
    await photoRepository.save(photo);

    // photo is saved. Now we need to save a photo metadata
    await metadataRepository.save(metadata);
    // await connection.manager.save(photo);
    // .then(photo => {
    //     console.log("Photo has been saved. Photo id is", photo.id);
    // }).catch(error => console.log(error));
    console.log("Photo has been saved");
    // let photos = await photoRepository.find({ relations: ["metadata"] });
    // let photos = await connection
    //         .getRepository(Photo)
    //         .createQueryBuilder("photo")
    //         .innerJoinAndSelect("photo.metadata", "metadata")
    //         .getMany();
    // console.log(photos);

    //     const entityManager = getManager();
    // const category1 = new Category();
    // category1.name = "Cycles";
    // await entityManager.save(category1);

    // const category2 = new Category();
    // category2.name = "Motos";
    // await entityManager.save(category2);

    // const post1 = new Post();
    // post1.name = "About BMW";
    // post1.categoryId = category1.id;
    // await entityManager.save(post1);

    // const post2 = new Post();
    // post2.name = "About Boeing";
    // post2.categoryId = category2.id;
    // await entityManager.save(post2);

    // const postCategories = await entityManager.find(PostCategory);
    // console.log(postCategories);
    // const postCategory = await entityManager.findOne(PostCategory, { id: 1 });

    const userRepository = getCustomRepository(UserRepository); // or connection.getCustomRepository or manager.getCustomRepository()
    const user = userRepository.create(); // same as const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age=125
    await userRepository.save(user);

    const timber = await userRepository.findByName("Timber", "Saw");
    console.log(timber);
    // insert new users for test
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Timber",
    //     lastName: "Saw",
    //     age: 27
    // }));
    // await connection.manager.save(connection.manager.create(User, {
    //     firstName: "Phantom",
    //     lastName: "Assassin",
    //     age: 24
    // }));

    console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));
