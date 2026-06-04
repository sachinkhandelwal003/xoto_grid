import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, Table, Tag } from "antd";
import {
  DollarOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function DeveloperRevenue() {

  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    pendingPayments: 0,
    totalDeals: 0
  });

  const [transactions, setTransactions] = useState([]);

  const developerId = localStorage.getItem("developerId");

  /* =============================
     FETCH REVENUE DATA
  ============================= */

  const fetchRevenue = async () => {

    try {

      const res = await apiService.get(
        `/property/developer-revenue/${developerId}`
      );

      if(res.success){

        setStats(res.stats);

        const formattedDeals = res.transactions.map((deal,i)=>({

          key: deal._id || i,

          client: `${deal.name?.first_name || ""} ${deal.name?.last_name || ""}`,

          project: deal.project?.propertyName || "N/A",

          amount: `₹ ${deal.dealValue || 0}`,

          status: deal.status === "closed" ? "Received" : "Pending"

        }));

        setTransactions(formattedDeals);

      }

    } catch (error) {

      

    }

  };

  useEffect(()=>{
    fetchRevenue();
  },[]);


  /* =============================
     STATS CARDS
  ============================= */

  const statCards = [

    {
      title: "Total Revenue",
      value: `₹ ${stats.totalRevenue}`,
      icon: <DollarOutlined />,
      color: "#5c039b",
      bg: "#f3e8ff"
    },

    {
      title: "This Month",
      value: `₹ ${stats.thisMonthRevenue}`,
      icon: <LineChartOutlined />,
      color: "#059669",
      bg: "#d1fae5"
    },

    {
      title: "Pending Payments",
      value: `₹ ${stats.pendingPayments}`,
      icon: <ClockCircleOutlined />,
      color: "#d97706",
      bg: "#fef3c7"
    },

    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: <CheckSquareOutlined />,
      color: "#2563eb",
      bg: "#dbeafe"
    }

  ];


  /* =============================
     STATUS COLOR
  ============================= */

  const getColor = (s) => {

    if (s === "Received") return "green";
    if (s === "Pending") return "orange";
    return "default";

  };


  /* =============================
     TABLE COLUMNS
  ============================= */

  const columns = [

    {
      title: "Client Name",
      dataIndex: "client",
      render: (text) => <Text strong>{text}</Text>
    },

    {
      title: "Project",
      dataIndex: "project"
    },

    {
      title: "Amount",
      dataIndex: "amount",
      render: (text) => <Text strong>{text}</Text>
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (
        <Tag color={getColor(s)}>
          {s}
        </Tag>
      )
    }

  ];


  return (

    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER */}

      <div style={{ marginBottom: 32 }}>

        <Title level={2}>
          Sales Revenue
        </Title>

        <Text type="secondary">
          Overview of your total sales, collections, and pending payments.
        </Text>

      </div>


      {/* STATS */}

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>

        {statCards.map((stat, index) => (

          <Col xs={24} sm={12} md={12} lg={6} key={index}>

            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: stat.bg,
                    color: stat.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24
                  }}
                >
                  {stat.icon}
                </div>

                <div>

                  <Text type="secondary">
                    {stat.title}
                  </Text>

                  <Title level={3} style={{ margin: 0 }}>
                    {stat.value}
                  </Title>

                </div>

              </div>

            </Card>

          </Col>

        ))}

      </Row>


      {/* DEALS TABLE */}

      <Card
        bordered={false}
        style={{ borderRadius: 12 }}
      >

        <Title level={5}>
          Recent Transactions
        </Title>

        <Table
          columns={columns}
          dataSource={transactions}
          pagination={false}
          rowKey="key"
        />

      </Card>

    </div>

  );

}