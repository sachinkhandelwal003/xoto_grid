import {
  Card,
  Typography,
  Table,
  Breadcrumb
} from "antd";

import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title } = Typography;

export default function DeveloperCommissionScheme() {

  const [commissionList,setCommissionList] = useState([]);

  /* =============================
     FETCH COMMISSION LIST
  ============================= */

  const fetchCommissionList = async () => {

    try{  

      const developerId = localStorage.getItem("developerId");

      const res = await apiService.get(`/property/developer-commissions/${developerId}`)
      if(res?.data?.success){
        setCommissionList(res.data.data);
      }

    }catch(error){
      
    }

  };

  useEffect(()=>{
    fetchCommissionList();
  },[]);


  /* =============================
     TABLE COLUMNS
  ============================= */

  const columns = [

  {
    title:"Agent",
    render:(_,record)=>
    `${record.agent?.first_name || ""} ${record.agent?.last_name || ""}`
  },

  {
    title:"Property",
    dataIndex:["project","propertyName"]
  },

  {
    title:"Deal Value",
    dataIndex:"dealValue"
  },

  {
    title:"Commission",
    dataIndex:"commission",
    render:(value)=> `₹ ${value}`
  },

  {
    title:"Date",
    dataIndex:"createdAt",
    render:(date)=> new Date(date).toLocaleDateString()
  }

  ];


  return (

    <div style={{ padding:24, background:"#f6f8fb", minHeight:"100vh" }}>

      <Breadcrumb style={{ marginBottom:18 }}>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Commission</Breadcrumb.Item>
      </Breadcrumb>


      <Card style={{ borderRadius:14 }}>

        <Title level={4}>Agent Commission List</Title>

        <Table
          columns={columns}
          dataSource={commissionList}
          rowKey="_id"
        />

      </Card>

    </div>

  );

}