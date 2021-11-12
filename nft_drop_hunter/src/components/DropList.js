import contract from "../contract/contract.json";
import Web3 from "web3";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const initialInfo = {
  connected: false,
  status: null,
  account: null,
  contract: null,
};

const initDropsState = {
  loading: false,
  list: [],
};

const DropList = () => {
  const [info, setInfo] = useState(initialInfo);
  const [drops, setDrops] = useState(initDropsState);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const init = async () => {
    if (window.ethereum?.isMetaMask) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      if (networkId == 4) {
        let web3 = new Web3(window.ethereum);
        setInfo({
          ...initialInfo,
          connected: true,
          account: accounts[0],
          contract: new web3.eth.Contract(contract.abi, contract.address),
        });
      } else {
        setInfo({
          ...initialInfo,
          status: "you need to be on the Ethereum testnet",
        });
      }
    } else {
      setInfo({ ...initialInfo, status: "you need metamask" });
    }
  };

  const initOnChanged = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };

  const getDrops = async () => {
    setDrops((prevState) => ({
      ...prevState,
      loading: true,
    }));
    info.contract.methods
      .getDrops()
      .call()
      .then((res) => {
        setDrops({
          loading: false,
          list: res,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = (data) => {
    let newData = {
      imageUri: data.imageUri,
      name: data.name,
      description: data.description,
      websiteUri: data.websiteUri,
      social_1: data.social_1,
      social_2: data.social_2,
      price: data.price,
      supply: Number(data.supply),
      presale: Number(data.presale),
      sale: Number(data.sale),
      chain: Number(data.chain),
      approved: false,
    };
    info.contract.methods
      .addDrop(Object.values(newData))
      .send({ from: info.account })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    init();
    initOnChanged();
  }, []);

  return (
    <div>
      <button onClick={() => getDrops()}>Get Drops</button>
      {drops.loading ? <p>Loading</p> : null}
      {drops.list.map((item) => {
        return (
          <div>
            <img
              alt={"drop logo"}
              src={item.imageUri}
              style={{ width: 160, height: 160 }}
            />
            <p>name: {item.name}</p>
            <p>description: {item.description}</p>
            <p>supply: {item.supply}</p>
            <p>sale: {item.sale}</p>
            <p>presale: {item.presale}</p>
            <p>social_1: {item.social_1}</p>
            <p>social_2: {item.social_2}</p>
          </div>
        );
      })}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>imageUri</label>
        <input {...register("imageUri")} />
        <br />
        <label>name</label>
        <input {...register("name")} />
        <br />
        <label>description</label>
        <input {...register("description")} />
        <br />
        <label>twitter</label>
        <input {...register("social_1")} />
        <br />
        <label>discord</label>
        <input {...register("social_2")} />
        <br />
        <label>website</label>
        <input {...register("websiteUri")} />
        <br />
        <label>price</label>
        <input {...register("price")} />
        <br />
        <label>supply</label>
        <input {...register("supply")} />
        <br />
        <label>presale</label>
        <input {...register("presale")} />
        <br />
        <label>sale</label>
        <input {...register("sale")} />
        <br />
        <label>chain</label>
        <input {...register("chain")} />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default DropList;

// "https://gateway.pinata.cloud/ipfs/QmT3czPYtLm3JMoFibHERtXxAKdB3NAonFEVamWeEXapvv/10.png",
// "Test 2",
// "This is my drop for the month",
// "twitter",
// "www.squidgames.fun",
// "fasffas",
// "0.05",
// "3456",
// 1635790237,
// 1635790237,
// 1,
// false
