import React, { FC, useContext, useEffect, useState } from "react";

import { SP2PClientContext } from "../App";
import styled from "styled-components";

const PeerList: FC = () => {
  const sp2pClient = useContext(SP2PClientContext);
  const kad = sp2pClient.kad;

  const [kBuckets, setKBuckets] = useState(
    kad.di.kTable.kBuckets.map(o => o.peers.map(v => v.kid))
  );

  useEffect(() => {
    const { unSubscribe } = kad.di.eventManager.addPeer.subscribe(() => {
      setKBuckets(kad.di.kTable.kBuckets.map(o => o.peers.map(v => v.kid)));
    });

    return () => unSubscribe();
  }, [kad]);

  return (
    <div>
      {kBuckets.map(
        (kbucket, i) =>
          kbucket.length > 0 && (
            <div key={"kbucket" + i}>
              {kbucket.map((kid, i) => (
                <PeerLabel key={"peer" + i}>{kid}</PeerLabel>
              ))}
            </div>
          )
      )}
    </div>
  );
};

const PeerLabel = styled.span`
  margin-right: 5px;
`;

export default PeerList;
