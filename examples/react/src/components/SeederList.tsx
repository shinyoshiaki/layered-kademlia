import React, { useContext, useEffect, useState } from "react";

import { SP2PClientContext } from "../App";

const SeederList: React.FC = () => {
  const sp2pClient = useContext(SP2PClientContext);
  const seeder = sp2pClient.actor.seeder;

  const [seederList, setSeederList] = useState(seeder.subnetList);

  useEffect(() => {
    seeder.onSubnetAdd.subscribe(() => {
      setSeederList(seeder.subnetList);
    });
  }, []);

  return <div>{JSON.stringify(seederList)}</div>;
};

export default SeederList;
