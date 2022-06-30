import { Installation } from "@slack/oauth";
import * as mongoDB from "mongodb";

export async function findInstallationById(db: mongoDB.Db, installationId: string) {
    return db.collection('Installations').findOne({
        installationId: installationId,
    }).then((installation) => installation || null);
  }

  export async function insertInstallation(db: mongoDB.Db, installationId:string, installation: Installation) {
    return db
      .collection('Installations')
      .insertOne({
        installationId: installationId,
        ...installation,
      })
      .then(({ acknowledged }) => acknowledged);
  }

  export async function deleteInstallation(db: mongoDB.Db, installationId:string) {
    return db
      .collection('Installations')
      .deleteOne({
        installationId: installationId
      })
      .then(({ acknowledged }) => acknowledged);
  }